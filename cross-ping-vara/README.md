# CrossPing

This is the Vara-side application for the cross-chain Ping example.
It sends a Ping message from the Vara network to Ethereum via the built-in Vara ↔ Ethereum Bridge.

## What does this application do?

- Initializes with the address of the destination contract on Ethereum.
- Packages a Ping message as a custom payload and sends it via the built-in bridge actor.
- Waits for the bridge to process the message, then emits a `PingSent` event for relayer pick-up.


## Requirements

- Rust and Rust toolchain [Quick guide](https://wiki.vara.network/docs/getting-started-in-5-minutes)

## Building

To build the program, run:

```sh
cargo build --release
```

## Useful Links

- [Bridge Built-in Actor API & Addresses](https://wiki.vara.network/docs/build/builtinactors/bia-bridge)

# PingReceiver (Vara Side)

**PingReceiver** is a minimal Rust smart contract (Gear program) for receiving cross-chain messages from Ethereum via the Gear Bridge.

It exposes a `submit_receipt` handler that is called by the bridge infrastructure (HistoricalProxy) when a new message from Ethereum is relayed and validated.

## What does this program do?

- Implements a single route, `submit_receipt`, which receives:
    - `slot`: Finalized Ethereum slot number
    - `transaction_index`: Transaction index in the block
    - `receipt_rlp`: RLP-encoded Ethereum receipt (event proof)
- Emits an internal event `PingFromEthereum` containing the received data.

## Building
```sh
cargo build --release
```

The output will be located in:

- `target/wasm32-gear/release/ping_receiver.opt.wasm` — Optimized WASM for deployment
- `target/wasm32-gear/release/ping_receiver.idl` — IDL for interface description

## Deploying

You can deploy the contract to Vara testnet using [Gear Idea](https://idea.gear-tech.io/):

1. Go to [Gear Idea](https://idea.gear-tech.io/).
2. Upload the `ping_receiver.opt.wasm` file as your contract code.
3. Upload the `ping_receiver.idl` as the interface description.
4. Follow the UI to instantiate the contract.
