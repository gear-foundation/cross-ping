import { ethers, ContractEventPayload, EventLog, WebSocketProvider } from 'ethers';
// @ts-ignore
import { GetProof } from 'eth-proof';
import rlp from 'rlp';

import { ETHEREUM_RPC_URL, ETH_CONTRACT_ADDRESS, ETH_PINGER_ABI, ETHEREUM_HTTPS_RPC_URL } from './config';

export let ethereumProvider: ethers.WebSocketProvider | null = null;

// 1. Connects to the Ethereum Holesky RPC
export async function connectEthereum(): Promise<ethers.WebSocketProvider> {
    if (ethereumProvider) return ethereumProvider;
    ethereumProvider = new ethers.WebSocketProvider(ETHEREUM_RPC_URL);
    await ethereumProvider.getBlockNumber();
    console.log('✅ Connected to Ethereum!');
    return ethereumProvider;
}

export function listenPingFromEthereum(
    provider: WebSocketProvider,
    onPing: (from: string, eventLog: EventLog) => void
) {
    const contract = new ethers.Contract(ETH_CONTRACT_ADDRESS, ETH_PINGER_ABI, provider);

    contract.on('PingFromEthereum', (from: string, payload: ContractEventPayload) => {
        onPing(from, payload.log);
    });

    console.log('🔔 Listening for PingFromEthereum events at:', ETH_CONTRACT_ADDRESS);
}

export async function getSlotForEvent(event: EventLog, provider: WebSocketProvider) {
    const block = await provider.getBlock(event.blockNumber);
    if (!block) throw new Error(`Block not found for number: ${event.blockNumber}`);
    const timestamp = block.timestamp;
    const GENESIS = 1695902400; // Holesky genesis timestamp
    const slot = Math.floor((timestamp - GENESIS) / 12);
    return slot;
}

export async function generateProof(txHash: string): Promise<string> {
    const proof = new GetProof(ETHEREUM_HTTPS_RPC_URL);
    const result = await proof.receiptProof(txHash);

    // header: Buffer[]
    const headerArr = Array.from(result.header as ArrayLike<Uint8Array>, (h) => Buffer.from(h));

    // receiptProof: Buffer[][]
    const proofArr = Array.from(result.receiptProof as ArrayLike<ArrayLike<Uint8Array>>, 
        (branch) => Array.from(branch, (b) => Buffer.from(b))
    );

    // txIndex: Buffer (один байт)
    const txIndexBuf = Buffer.from(
        typeof result.txIndex === "string"
            ? result.txIndex.replace(/^0x/, "")
            : [result.txIndex]
        , "hex"
    );

    // Собираем массив и сериализуем через RLP
    const proofTuple = [headerArr, proofArr, txIndexBuf];
    const serializedProof = '0x' + Buffer.from(rlp.encode(proofTuple)).toString('hex');

    return serializedProof;
}