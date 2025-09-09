# Relayer for CrossPing

This is the relayer for the **Ethereum ↔ Vara CrossPing** example.

The relayer listens for events on Ethereum and delivers verified messages to a Vara program via the bridge infrastructure.

## What does this application do?

- Connects to Ethereum (WebSocket for event streaming) and Vara (WebSocket).
- Subscribes to the `EthPinger` contract event: `PingFromEthereum(address indexed from)`.
- For each event, it calls `relayEthToVara`, which:
  - composes the required Ethereum proof package,
  - waits for checkpoint finality (`wait: true`),
  - submits the message to the Historical Proxy on Vara,
  - forwards it to your program method `PingReceiver::SubmitReceipt`.
- Logs relay status updates for observability.

> Proof composition and checkpoint tracking are handled internally by `@gear-js/bridge`.

## Requirements

- Node.js 18+
- Yarn

## Environment Variables (`.env`)

Create a `.env` file in the project root:

```env
# === Vara ===
VARA_RPC_URL=wss://testnet.vara.network
VARA_MNEMONIC_KEY=<your_vara_mnemonic>

# === Bridge on Vara ===
CHECKPOINT_LIGHT_CLIENT=0x...
HISTORICAL_PROXY_ID=0x...
PING_RECEIVER_PROGRAM_ID=0x...

# === Ethereum (Hoodi) ===
ETHEREUM_RPC_URL=wss://hoodi-reth-rpc.gear-tech.io/ws     # WebSocket for ethers event subscription
ETHEREUM_HTTPS_RPC_URL=https://hoodi-reth-rpc.gear-tech.io # HTTP for viem receipt/proofs
ETH_CONTRACT_ADDRESS=0x...

# === Beacon API ===
BEACON_API_URL=https://lodestar-hoodi.chainsafe.io
```

### Variable descriptions

- `VARA_RPC_URL` — Vara WebSocket RPC endpoint  
- `VARA_MNEMONIC_KEY` — mnemonic for the Vara account used by the relayer  
- `CHECKPOINT_LIGHT_CLIENT` — address of the Checkpoint Light Client on Vara  
- `HISTORICAL_PROXY_ID` — address of the Historical Proxy on Vara  
- `PING_RECEIVER_PROGRAM_ID` — your target Vara program address  
- `ETHEREUM_RPC_URL` — Ethereum **WebSocket** RPC (used by ethers for live events)  
- `ETHEREUM_HTTPS_RPC_URL` — Ethereum **HTTP** RPC (used by viem for receipts/proofs)  
- `ETH_CONTRACT_ADDRESS` — deployed `EthPinger` contract address  
- `BEACON_API_URL` — Beacon API endpoint

## Build & Run

Install dependencies:

```bash
yarn install
```

Start in dev (TypeScript via tsx):

```bash
yarn dev
```

Or build and run the compiled output:

```bash
yarn build
yarn start   # runs node dist/main.js
```

The entry point is `src/main.ts`.

## Project Structure

- `src/config.ts` — environment loading and configuration constants
- `src/ethereum.ts` — Ethereum connector & event listener (ethers v6, WS)
- `src/vara.ts` — Vara connector & signer
- `src/types.ts` — EthPinger ABI (no extra types)
- `src/bridge-shim.ts` — safe import for `relayEthToVara` (avoids package re-export issues)
- `src/main.ts` — application entry point (wires up listeners and relay flow)
- `.env` — environment variables (endpoints, addresses, keys)