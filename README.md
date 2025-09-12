# Vara ↔ Ethereum Cross-Chain Ping

**CrossPing** is a minimal decentralized application (dApp) example that demonstrates secure message delivery between **Ethereum** and **Vara** using the Vara ↔ Ethereum Bridge.  
It is designed as a teaching and reference project, showing how a simple "Ping" message can travel across chains in both directions.

The project consists of six main components, grouped into two flows:

### ETH → VARA
- **eth-vara-pinger-eth** — a solidity smart contract on Ethereum that initiates a ping.  
- **eth-vara-relayer-node** — a Node.js/TypeScript relayer service forwarding messages from Ethereum to Vara.  
- **eth-vara-receiver-vara** — a Vara program (Rust/Sails) that receives the ping.

### VARA → ETH
- **vara-eth-pinger-vara** — a Vara program (Rust/Sails) that initiates a ping.  
- **vara-eth-relayer-node** — a Node.js/TypeScript relayer service forwarding messages from Vara to Ethereum.  
- **vara-eth-receiver-eth** — a solidity smart contract on Ethereum that receives the ping.


This repository serves as a **minimal working cross-chain example**.  

It can be used by developers to:
- Understand how the Vara ↔ Ethereum Bridge works in practice.  
- Experiment with sending and receiving messages across chains.  
- Learn how relayers and contracts integrate into a simple end-to-end flow.  

## Installation

From the repository root:

```bash
pnpm install
```

This installs dependencies for all workspace packages.


## Build

Build all JS/TS packages and all Rust projects:

```bash
pnpm build
```

Or separately:

```bash
pnpm build:js
pnpm build:rust
```

## Run Relayers

- ETH → VARA:
  ```bash
  pnpm --filter eth-vara-relayer-node dev
  ```

- VARA → ETH:
  ```bash
  pnpm --filter vara-eth-relayer-node dev
  ```

## Deploy and Ping (Hardhat Contracts)

- Deploy pinger on Ethereum (Holesky network):
  ```bash
  pnpm --filter eth-vara-pinger-eth deploy
  ```

- Send a ping from Ethereum:
  ```bash
  pnpm --filter eth-vara-pinger-eth ping
  ```

- Deploy receiver on Ethereum (Hoodi network):
  ```bash
  pnpm --filter vara-eth-receiver-eth deploy
  ```

## Build Vara Programs

Rust/Sails packages are built via the root Cargo workspace:

```bash
cargo build --workspace
```

Or individually:

```bash
pnpm --filter eth-vara-receiver-vara build
pnpm --filter vara-eth-pinger-vara build
```

## Run Order per Flow

### Vara → Ethereum Flow
1. **Deploy PingReceiver on Ethereum** using Hardhat.  
2. **Deploy Vara Ping program** (`vara-eth-pinger-vara`) via [Gear IDEA](https://idea.gear-tech.io/).  
   - Provide the Ethereum PingReceiver’s **H160 address** (20 bytes) as the **initial payload**.  
3. **Start the Vara → ETH relayer** (`vara-eth-relayer-node`) with the proper configuration.  
4. **Trigger a Ping** directly from Vara (via IDEA’s *SendMessage*).  
5. With the relayer running, the Ping is delivered and processed on Ethereum.

### Ethereum → Vara Flow
1. **Deploy EthPinger contract** on Ethereum (`eth-vara-pinger-eth`).  
2. **Deploy Vara PingReceiver program** (`eth-vara-receiver-vara`) via [Gear IDEA](https://idea.gear-tech.io/).  
3. **Start the ETH → Vara relayer** (`eth-vara-relayer-node`) with the proper configuration.  
4. **Trigger a Ping** by calling the `ping()` function in the EthPinger contract.  
5. With the relayer running, the Ping is delivered and processed on Vara.
