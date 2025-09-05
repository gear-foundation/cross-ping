import type { Abi } from "viem";

// Ethereum → Vara relay types
export const ETH_CROSS_PING_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
    ],
    name: "PingSent",
    type: "event",
  },
] as const satisfies Abi;

// Vara → Ethereum relay types
export type PingSentEvent = {
  nonce: bigint;
  messageHash: `0x${string}`;
  blockNumber: bigint;
};

export const VARA_CROSS_PING_IDL = `type Error = enum {
  DestinationNotInitialized,
  BridgeSendFailed,
  BridgeReplyFailed,
  InvalidBridgeResponse,
};

type PingSent = struct {
  nonce: opt u64,
  message_hash: h256,
};

constructor {
  Create : ();
};

service Sender {
  SendPing : (destination: h160) -> result (null, Error);

  events {
    PingSent: PingSent;
  }
};

service Receiver {
  SubmitReceipt : (slot: u64, transaction_index: u32, _receipt_rlp: vec u8) -> result (null, str);

  events {
    ReceiptSubmitted: struct {
      u64,
      u32,
    };
  }
};`;
