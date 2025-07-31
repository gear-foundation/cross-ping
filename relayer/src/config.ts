import { config } from 'dotenv';

config();

export const VARA_RPC_URL = process.env.VARA_RPC_URL;
export const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL as string;
export const ETHEREUM_HTTPS_RPC_URL = process.env.ETHEREUM_HTTPS_RPC_URL as string;
export const BEACON_API_URL = process.env.BEACON_API_URL as string;

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

export const PROOF_IDL = `
type EthToVaraEvent = struct {
  proof_block: BlockInclusionProof,
  proof: vec vec u8,
  transaction_index: u64,
  receipt_rlp: vec u8,
};

type BlockInclusionProof = struct {
  block: BlockGenericForBlockBody,
  headers: vec BlockHeader,
};

type BlockGenericForBlockBody = struct {
  slot: u64,
  proposer_index: u64,
  parent_root: h256,
  state_root: h256,
  body: BlockBody,
};

type BlockBody = struct {
  randao_reveal: h256,
  eth1_data: h256,
  graffiti: BytesFixed1,
  proposer_slashings: h256,
  attester_slashings: h256,
  attestations: h256,
  deposits: h256,
  voluntary_exits: h256,
  sync_aggregate: h256,
  execution_payload: ExecutionPayload,
  bls_to_execution_changes: h256,
  blob_kzg_commitments: h256,
  execution_requests: h256,
};

type BytesFixed1 = struct {
  FixedArray1ForU8,
};

type FixedArray1ForU8 = struct {
  [u8, 32],
};

type ExecutionPayload = struct {
  parent_hash: BytesFixed1,
  fee_recipient: BytesFixed2,
  state_root: BytesFixed1,
  receipts_root: BytesFixed1,
  logs_bloom: h256,
  prev_randao: BytesFixed1,
  block_number: u64,
  gas_limit: u64,
  gas_used: u64,
  timestamp: u64,
  extra_data: ByteList,
  base_fee_per_gas: u256,
  block_hash: BytesFixed1,
  transactions: h256,
  withdrawals: h256,
  blob_gas_used: u64,
  excess_blob_gas: u64,
};

type BytesFixed2 = struct {
  FixedArray2ForU8,
};

type FixedArray2ForU8 = struct {
  [u8, 20],
};

type ByteList = struct {
  ListForU8,
};


type ListForU8 = struct {
  data: vec u8,
};

type BlockHeader = struct {
  slot: u64,
  proposer_index: u64,
  parent_root: h256,
  state_root: h256,
  body_root: h256,
};

type CheckedProofs = struct {
  receipt_rlp: vec u8,
  transaction_index: u64,
  block_number: u64,
  slot: u64,
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

constructor {
  New : (checkpoint_light_client_address: actor_id);
};

service EthereumEventClient {
  CheckProofs : (message: EthToVaraEvent) -> result (CheckedProofs, Error);
  query CheckpointLightClientAddress : () -> actor_id;
};
`;