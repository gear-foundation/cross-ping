import { config } from 'dotenv';

config();

export const VARA_RPC_URL = process.env.VARA_RPC_URL;
export const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL as string;
export const ETHEREUM_HTTPS_RPC_URL = process.env.ETHEREUM_HTTPS_RPC_URL as string;

// vara contract addresses
export const CHECKPOINT_LIGHTH_CLIENT = process.env.CHECKPOINT_LIGHTH_CLIENT;
export const HISTORICAL_PROXY_ID = process.env.HISTORICAL_PROXY_ID as string;
export const PING_RECEIVER_PROGRAM_ID = process.env.PING_RECEIVER_PROGRAM_ID as string;
export const PING_RECEIVER_ROUTE = "PingReceiver0SubmitReceipt";

export const VARA_MNEMONIC_KEY = process.env.VARA_MNEMONIC_KEY as string;

// ethereum contract addresses
export const ETH_CONTRACT_ADDRESS = process.env.ETH_CONTRACT_ADDRESS as string;
export const PRIVATE_KEY = process.env.PRIVATE_KEY;

export const ETH_PINGER_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      }
    ],
    "name": "PingFromEthereum",
    "type": "event"
  }
];

export const CHECKPOINT_LIGHT_CLIENT_IDL = `
  service ServiceSyncUpdate {
    events {
      NewCheckpoint: struct {
        slot: u64,
        tree_hash_root: h256,
      };
    }
  };
`;

export const HISTORICAL_PROXY_IDL = `
  type ProxyError = enum {
    NoEndpointForSlot: u64,
    SendFailure: str,
    ReplyFailure: str,
    DecodeFailure: str,
    EthereumEventClient: Error,
  };

  type Error = enum {
    DecodeReceiptEnvelopeFailure,
    FailedEthTransaction,
    SendFailure,
    ReplyFailure,
    HandleResultDecodeFailure,
    MissingCheckpoint,
    InvalidBlockProof,
    TrieDbFailure,
    InvalidReceiptProof,
  };

  service HistoricalProxy {
    Redirect : (slot: u64, proofs: vec u8, client: actor_id, client_route: vec u8) -> result (struct { vec u8, vec u8 }, ProxyError);

    events {
      Relayed: struct {
        slot: u64,
        block_number: u64,
        transaction_index: u32,
      };
    }
  };
`;


