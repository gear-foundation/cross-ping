# Vara ↔ Ethereum Cross-Chain Ping

This is a minimal working example of a cross-chain application (Ping) demonstrating secure message delivery **from Ethereum to Vara** via the Vara ↔ Ethereum Bridge.

The project consists of three main components:

- `eth-pinger/` – The Ethereum-side contract (Solidity): emits a ping event.
- `relayer/` – The permissionless relayer (Node.js/TypeScript): listens for Ethereum events, builds proofs, and delivers messages to Vara.
- `ping-receiver/` – The Vara-side program (Rust): receives the cross-chain message and emits an internal event.

---

## Run Order

To run the Ethereum → Vara Cross-Chain Ping example end-to-end, follow these steps:

1. **Deploy the Ethereum Contract (`eth-pinger`)**
   - Deploy `EthPinger.sol` to Ethereum (e.g., Holesky testnet).
   - Save the deployed contract address for use in the next steps.

2. **Build & Deploy the Vara Program (`ping-receiver`)**
   - Build the optimized WASM:
     ```sh
     cargo build --release 
     ```
   - Deploy `ping_receiver.opt.wasm` and `ping_receiver.idl` to the Vara network (testnet) using [Gear Idea](https://idea.gear-tech.io/).
   - Save your program address.

3. **Configure and Start the Relayer**
   - In the `relayer/` directory, create a `.env` file with all required endpoints, addresses, and keys.
   - Install dependencies and start the relayer:
     ```sh
     yarn install
     yarn dev
     ```

4. **Send a Ping from Ethereum**
   - Call the `ping()` function in your deployed Ethereum contract (`eth-pinger`), e.g.:
     ```sh
     yarn ping
     ```
   - The relayer will automatically detect the event, build a proof, and deliver the message to Vara once the slot is finalized.

5. **Wait for Slot Finalization & Check Delivery**
   - Wait **15–20 minutes** for Light Client slot synchronization and message processing.
   - In [Gear Idea](https://idea.gear-tech.io/) or any Vara explorer, check your program’s messages.

---

## What does this example show?

- **End-to-end flow:** How to emit, relay, and receive messages across Ethereum and Vara using trustless infrastructure.
- **Minimal code:** All business logic lives in your contracts/programs. Transport, security, and consensus are handled by the bridge.
- **Extensible pattern:** Use this template for more advanced use cases (tokens, DeFi, NFTs, etc).

---

_This example is intended for developers interested in cross-chain messaging, bridge integration, and hands-on experimentation._

**Learn more about the Vara ↔ Ethereum Bridge:**  
[https://wiki.vara.network/docs/bridge](https://wiki.vara.network/docs/bridge)