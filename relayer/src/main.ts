import { connectVara, listenForNewCheckpoint, sailsCheckpoint, sailsHistorical, sendToHistoricalProxy, connectWallet } from './vara';
import { connectEthereum, listenPingFromEthereum, getSlotForEvent, generateProof } from './ethereum';
import { ethers } from 'ethers';

import { PingMessage, NewCheckpointEvent } from './types';

let lastVaraSlot: number | null = null;
let pingMessages: PingMessage[] = [];

async function main() {
    // Connect to Vara and Ethereum
    await connectVara();
    const ethApi = await connectEthereum();
    const wallet = connectWallet();

    listenPingFromEthereum(ethApi, async (from: string, event: ethers.EventLog) => {
        const slot = await getSlotForEvent(event, ethApi);
        const proof: any = await generateProof(event.transactionHash, slot, ethApi);
        const msg: PingMessage = {
            from,
            blockNumber: event.blockNumber,
            txHash: event.transactionHash,
            slot,
            proof,
        };
        pingMessages.push(msg);
        console.log('🟢 new ping message', msg);
    });

    listenForNewCheckpoint(sailsCheckpoint, (event: NewCheckpointEvent) => {
        lastVaraSlot = Number(event.slot);
        console.log('🟢 new checkpoint', event);

        if (!pingMessages.length) return;

        // Relay ready messages
        const ready = pingMessages.filter(msg => lastVaraSlot !== null && msg.slot <= lastVaraSlot);
        if (ready.length) {
            console.log(`🚀 [Checkpoint ${lastVaraSlot}] Ready for relay:`, ready.map(m => m.txHash));
            sendToHistoricalProxy(sailsHistorical, wallet, ready[0])
        }

        // Clean up the queue
        pingMessages = pingMessages.filter(msg => lastVaraSlot === null || msg.slot > lastVaraSlot);
    });

    console.log('\n🚀 Relayer is running and listening for Pings from Ethereum...');
}

main().catch(e => {
    console.error('Fatal:', e);
    process.exit(1);
});