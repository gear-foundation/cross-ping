# Relayer for CrossPing

This is the relayer for the **Ethereum ↔ Vara CrossPing** example.

The relayer listens for events on Ethereum, builds proofs, and delivers messages to Vara for trustless processing via the bridge infrastructure.

## What does this application do?

- Connects to both Ethereum and Vara networks.
- Listens for `PingFromEthereum` events emitted by the EthPinger contract on Ethereum.
- For each event:
    - Calculates the Ethereum beacon chain slot (based on block timestamp).
    - Builds an event inclusion proof (using eth-proof).
    - Prepares a message (slot, proof, destination, and payload) for relay.
- Waits for the slot to be finalized on Vara (Checkpoint Light Client).
- Submits the message to the Historical Proxy contract on Vara for validation and delivery to the target application program.

It is implemented in Node.js/TypeScript, but any language can be used as long as required APIs are supported.

## Requirements

- Node.js (v18+ recommended)
- Yarn (`npm install -g yarn`)

## Environment Variables (`.env`)

Create a `.env` file in the project root with the following variables:

```env
VARA_RPC_URL=wss://testnet.vara.network
CHECKPOINT_LIGHTH_CLIENT=0x88d171bc5a624cff727048829d636d75e195d94350fe19846fa59052578e0a79
HISTORICAL_PROXY_ID=0xb764ed461f78c54b464c8c1b5f35a27017906d78ce0e58c61ca47402cfc89ace
PING_RECEIVER_PROGRAM_ID=<your_ping_receiver_program_address>
ETHEREUM_RPC_URL=wss://reth-rpc.gear-tech.io/ws
ETHEREUM_HTTPS_RPC_URL=https://reth-rpc.gear-tech.io
ETH_CONTRACT_ADDRESS=<your_eth_pinger_contract_address>
VARA_MNEMONIC_KEY=<your_vara_mnemonic>
```

> **Never commit your PRIVATE_KEY or VARA_MNEMONIC_KEY to version control.**  
> Use test values and keep sensitive keys secure!

- `VARA_RPC_URL` — Vara node WebSocket endpoint
- `HISTORICAL_PROXY_ID` — Address of the Historical Proxy contract on Vara
- `PING_RECEIVER_PROGRAM_ID` — Address of your target application program on Vara
- `ETHEREUM_RPC_URL` — Ethereum node WebSocket endpoint
- `ETHEREUM_HTTPS_RPC_URL` — Ethereum HTTPS endpoint
- `ETH_CONTRACT_ADDRESS` — Deployed EthPinger contract address on Ethereum
- `VARA_MNEMONIC_KEY` — Mnemonic for the Vara relayer wallet

## Building & Running

Install dependencies:

```sh
yarn install
```

To start the relayer:

```sh
yarn dev
```

The entry point is `src/main.ts`.  
You can customize or extend listeners and relay logic as needed.

## Project Structure

- `src/config.ts` — Configuration constants and IDLs
- `src/ethereum.ts` — Ethereum connection & event listeners
- `src/vara.ts` — Vara connection & event listeners
- `src/types.ts` — Type definitions
- `src/main.ts` — Application entry point (starts all listeners and the relay loop)
- `.env` — Environment variables (endpoints, contract addresses, keys)