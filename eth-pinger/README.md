# Eth Pinger (Ethereum Side)

PingReceiver is a minimal Solidity contract for the Ethereum ↔ Vara Cross Ping example.

## What does this contract do?
- Emits a `PingFromEthereum(msg.sender)` event with the sender address.

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