# Eth Pinger

**EthPinger** is a minimal Solidity contract for cross-chain messaging in the Ethereum ↔ Vara Ping-Pong example.  
It emits a `PingFromEthereum` event, which can be relayed to Vara using the Gear bridge infrastructure.

## What does this contract do?

- Provides a single function, `ping()`, callable by anyone.
- Emits a `PingFromEthereum(msg.sender)` event with the caller’s Ethereum address.
- Used as the entry point for relaying "ping" events from Ethereum to Vara.

## Requirements

- Node.js v18+
- Yarn (`npm install -g yarn`)

## Environment Variables

Create a `.env` file in the project root with the following:

```env
PRIVATE_KEY=your_ethereum_private_key_here
RPC_URL=https://reth-rpc.gear-tech.io
CONTRACT_ADDRESS=your_deployed_contract_address_here
```

- `PRIVATE_KEY` — Ethereum account private key for deployment/transactions.
- `RPC_URL` — Ethereum RPC endpoint (e.g., Holesky testnet).
- `CONTRACT_ADDRESS` — Deployed EthPinger contract address (required for sending pings).

## Usage

Install dependencies:

```sh
yarn install
```

### Deploy the contract

Deploy the contract to Ethereum (e.g., Holesky):

```sh
yarn deploy
```

The deployment script is located in `scripts/deploy.js`.  
After deployment, update your `.env` with the new `CONTRACT_ADDRESS`.

### Send a Ping

To call the `ping()` function and emit an event:

```sh
yarn ping
```

The script for sending a ping is located in `scripts/ping.js`.

## Project Structure

- `contracts/ping-emmiter.sol` — The main Solidity contract.
- `scripts/deploy.js` — Deployment script.
- `scripts/sendPing.js` — Script to send a ping transaction.
- `.env` — Environment variables for private key, RPC, and contract address.
