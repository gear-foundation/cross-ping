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