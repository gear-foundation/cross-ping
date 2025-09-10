# PingReceiver (Ethereum Side)

PingReceiver is a minimal Solidity contract for the Vara ↔ Ethereum CrossPing example.

It receives messages from the bridge on Ethereum, verifies them via the bridge protocol, and emits a `PongEmitted` event as confirmation.

## What does this contract do?

- Implements the standard IMessageQueueReceiver interface for the bridge.
- Receives and handles cross-chain messages from Vara.
- Emits a `PongEmitted` event with the sender address for each processed message.

## Requirements

- Node.js (v18+ recommended)
- Yarn (`npm install -g yarn`)

## Environment variables (`.env`)

Create a `.env` file in the project root with the following variables:

```env
PRIVATE_KEY=your_ethereum_private_key_here
RPC_URL=https://reth-rpc.gear-tech.io
```

## Building & Deploying

Install dependencies:

```sh
yarn install
```

To deploy the contract to the Holesky testnet, run:

```sh
yarn deploy
```

The deployment script is located in `scripts/deploy.js`.


## Project Structure

- `contracts/ping-receiver.sol` — The main contract (Solidity)
- `scripts/deploy.js` — Deployment script (Hardhat)
- `.env` — Environment variables for deployer account and network