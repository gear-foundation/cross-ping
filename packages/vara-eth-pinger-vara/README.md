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
