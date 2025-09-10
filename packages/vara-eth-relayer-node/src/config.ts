import { config } from 'dotenv';

config();

export const VARA_RPC_URL = process.env.VARA_RPC_URL;
export const ETHEREUM_HTTPS_RPC_URL = process.env.ETHEREUM_HTTPS_RPC_URL as string;
export const CROSS_PING_PROGRAM_ID = process.env.CROSS_PING_PROGRAM_ID as `0x${string}`;

// ethereum contract addresses
export const MESSAGE_QUEUE_PROXY_ADDRESS = process.env.MESSAGE_QUEUE_PROXY_ADDRESS as `0x${string}`;
export const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;

// cross-ping idl
export const CROSS_PING_IDL = `
type Error = enum {
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
  New : (destination: h160);
};

service CrossPing {
  SendPing : () -> result (null, Error);

  events {
    PingSent: PingSent;
  }
};
`;
