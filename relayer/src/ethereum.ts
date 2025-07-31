import { ethers, ContractEventPayload, EventLog, WebSocketProvider } from 'ethers';
// @ts-ignore
import { GetProof } from 'eth-proof';
import { RLP } from '@ethereumjs/rlp';

import { ETHEREUM_RPC_URL, ETH_CONTRACT_ADDRESS, ETH_PINGER_ABI, ETHEREUM_HTTPS_RPC_URL, BEACON_API_URL } from './config';
import { normalizeBlock } from './helper2'
import { sailsProof } from './vara'

export let ethereumProvider: ethers.WebSocketProvider | null = null;

// Connects to Ethereum RPC
export async function connectEthereum(): Promise<ethers.WebSocketProvider> {
    if (ethereumProvider) return ethereumProvider;
    ethereumProvider = new ethers.WebSocketProvider(ETHEREUM_RPC_URL);
    await ethereumProvider.getBlockNumber();
    console.log('✅ Connected to Ethereum!');
    return ethereumProvider;
}

// Listen for PingFromEthereum events
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

// Get slot number for event
export async function getSlotForEvent(event: EventLog, provider: WebSocketProvider) {
    const block = await provider.getBlock(event.blockNumber);
    if (!block) throw new Error(`Block not found for number: ${event.blockNumber}`);
    const timestamp = block.timestamp;
    const GENESIS = 1695902400; // Holesky genesis timestamp
    const slot = Math.floor((timestamp - GENESIS) / 12);
    return slot;
}

// Generate EthToVaraEvent proof object
export async function generateProof(txHash: string, slot: number, provider: WebSocketProvider) {
    const proof = new GetProof(ETHEREUM_HTTPS_RPC_URL);
    const result = await proof.receiptProof(txHash);

    // Normalize beacon header and block
    const rawHeader = await getBeaconHeader(slot);
    const rawBlock = await getBeaconBlock(slot);

    console.log(rawBlock.body.randao_reveal);

    const BaconBlock = normalizeBlock(rawBlock);

    console.log("extra_data",BaconBlock.body.execution_payload.extra_data);

    // Receipt Merkle proof (array of arrays)
    const proofArr = Array.from(result.receiptProof as ArrayLike<ArrayLike<Uint8Array>>,
        (branch) => Array.from(branch, (b) => new Uint8Array(b))
    );
    const transaction_index = typeof result.txIndex === "string" ? parseInt(result.txIndex, 16) : Number(result.txIndex);

    // RLP-encode transaction receipt
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) throw new Error(`No receipt found for txHash: ${txHash}`);
    const rlpReceipt = RLP.encode([
        receipt.status ? '0x1' : '0x0',
        receipt.cumulativeGasUsed.toString(),
        receipt.logsBloom,
        receipt.logs.map(log => [
          log.address,
          ...log.topics,
          log.data
        ])
    ]);

    // Final EthToVaraEvent structure
    const ethToVaraEvent = {
        proof_block: {
            block: BaconBlock,
            headers: [rawHeader],
        },
        proof: proofArr,
        transaction_index,
        receipt_rlp: rlpReceipt
    };

    const encodedProof = sailsProof.services.EthereumEventClient.functions.CheckProofs.encodePayload(ethToVaraEvent);

    console.log('ethToVaraEvent', encodedProof);

    return encodedProof;
}

// Fetch beacon header
export async function getBeaconHeader(slot: number) {
    const url = `${BEACON_API_URL}/eth/v1/beacon/headers/${slot}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Beacon header fetch error: ${res.statusText}`);
    const data = await res.json();
    return data.data.header.message;
}

// Fetch beacon block
export async function getBeaconBlock(slot: number) {
    const url = `${BEACON_API_URL}/eth/v2/beacon/blocks/${slot}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch beacon block: ${res.statusText}`);
    const data = await res.json();
    return data.data.message;
}