#!/usr/bin/bash

source ~/.nvm/nvm.sh
nvm use
nvm install
node ./test-client.js --id phil-test --key ./optimiser.key --url wss://staging-relay.juggle.energy --role optimiser

