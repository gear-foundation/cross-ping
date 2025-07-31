export interface EthereumProvider {
    provider: any;
    wallet: any;
    contract: any;
} 

export type PingMessage = {
    from: string,
    blockNumber: number,
    txHash: string,
    slot: number,
    proof: string,
};

export interface NewCheckpointEvent {
    slot: number;
    tree_hash_root: string;
}

export interface EthToVaraEvent {
    proof_block: BlockInclusionProof;
    proof: Uint8Array[][];
    transaction_index: number;
    receipt_rlp: Uint8Array;
  }
  
  export interface BlockInclusionProof {
    block: LightBeaconBlock;
    headers: BeaconBlockHeader[];
  }
  
  export interface LightBeaconBlock {
    slot: number;
    proposer_index: number;
    parent_root: Uint8Array;
    state_root: Uint8Array;
    body: LightBeaconBlockBody;
  }
  
  export interface LightBeaconBlockBody {
    execution_payload: ExecutionPayload;
  }
  
  export interface ExecutionPayload {
    block_number: number;
    receipts_root: Uint8Array;
    // and many things
  }
  
  export interface BeaconBlockHeader {
    slot: number;
    proposer_index: number;
    parent_root: Uint8Array;
    state_root: Uint8Array;
    body_root: Uint8Array;
  }