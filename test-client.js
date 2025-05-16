#!/usr/bin/env node
/*
 * Test Client for the Optimiser relay
 * Usage examples
 * --------------
 * # Optimiser (sends an instruction every 20 s and logs battery_state)
 * node test-client.js --id optimiser-main --key <path to private key> --url ws://localhost:8080
 *
 * Command‑line flags
 * -----------------
 * --id       clientId registered with server (required)
 * --key      private key file path
 * --url      ws:// or wss:// endpoint (default: ws://localhost:8080)
 * --hb       heartbeat interval ms   (default: 30000)
 * --issuer   JWT iss claim           (default: Juggle Energy Ltd)
 * --aud      JWT aud claim           (default: optimiser-device-adapter)
 *
 */

import 'dotenv/config';
import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import minimist from 'minimist';
import fs from 'fs';

/***************** Parse CLI flags *****************/
const argv = minimist(process.argv.slice(2), {
  string: ['id', 'key', 'url', 'issuer', 'aud'],
  default: {
    url: process.env.URL || 'ws://localhost:8080',
    hb: process.env.HEARTBEAT_MS || 30000,
    issuer: process.env.ISSUER || 'Juggle Energy Ltd',
    aud: process.env.AUD || 'optimiser-device-adapter'
  },
  alias: { hb: 'heartbeat' }
});

const { id, key, url, hb, issuer, aud } = argv;

if (!id || !key) {
  console.error('❌  --id and --key are required');
  process.exit(1);
}

/***************** Load key from provided path *************/
const loadedKey = (() => {
    try {
      return fs.readFileSync(key, 'utf8');
    } catch (err) {
      console.error('❌  failed to load key from file', err);
      process.exit(1);
    }
})();

/***************** Create JWT & connect *************/
const token = jwt.sign({}, loadedKey, {
  algorithm: 'ES256',
  issuer,
  audience: aud,
  subject: id,
  expiresIn: '60s'
});

console.log('🔑  JWT created:', token);

console.log(`🔌  Connecting to ${url} as (${id}) …`);
const ws = new WebSocket(url);

ws.on('open', () => {
  // Send auth packet
  ws.send(JSON.stringify({ type: 'auth', clientId: id, token }));
  console.log('✅  Auth message sent');

  startOptimiserLoops();

  // Start heartbeat loop
  setInterval(() => {
    ws.send(JSON.stringify({ type: 'heartbeat' }));
  }, hb);
});

/*************** Handle incoming messages from server **********/
ws.on('message', (data) => {
  try {
    const msg = JSON.parse(data.toString());
    if (msg.type === 'error') {
      console.error('🚨  Error from server:', msg.reason);
    } else if (msg.type === 'battery_state') {

      /* Example payload from device
       * {
       *   "type": "battery_state",
       *   "deviceId": "device-123",
       *   "data": {
       *       "power_MW": 0.25,
       *       "energy_SoC_MWh": 0.5,
       *       "ts": "2025-05-14T12:00:00Z"
       *   }
       * }
       */

      console.log('⬇️  battery_state from', msg.deviceId, '\tSOC', msg.data);
    } else {
      console.log('ℹ️  message:', msg);
    }
  } catch (err) {
    console.error('⚠️  failed to parse incoming JSON', err);
  }
});

ws.on('close', (code, reason) => {
  console.warn(`🔌  connection closed (${code})`, reason);
  process.exit(0);
});

ws.on('error', (err) => console.error('🚨  WS error', err));

function startOptimiserLoops() {
  // Fire an instruction every 20 s targeting device‑123 by default
  setInterval(() => {
    const target = 'device-123';
    const actionTime = new Date(Date.now() + 60_000).toISOString();
    const msg = {
      type: 'instruction',
      deviceId: target,
      data: {
          actions: [
            { t: actionTime, rateKw: 3.5 }
          ]
      }
    };
    ws.send(JSON.stringify(msg));
    console.log('⬆️  instruction sent to', target);
  }, 20_000);
}
