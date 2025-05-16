# Optimiser relay model client
This project will run under a wide range of node versions, but it has been tested with Node v20.5.1
## Setup
```bash
    # Install dependencies
    npm install
```
## Generate a keypair
The following command generates a new keypair and saves it to the current directory. The private key is saved in `optimiser.key` and the public key is saved in `optimiser.pub`.
```bash
    # Generate an ECDSA P‐256 private key
    openssl ecparam -name prime256v1 -genkey -noout -out optimiser.key
    # Extract the corresponding public key
    openssl ec -in optimiser.key -pubout -out optimiser.pub
```
## Connect to the relay
The following command connects to the relay server and starts a client that will send instructions to a device with the ID 'device-123'. It takes a private key as an argument to generate the JWT token for authentication.
```bash
    node test-client.js --id optimiser-main --key optimiser.key --url ws://localhost:8080
```