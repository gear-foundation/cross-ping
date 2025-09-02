import { ethers, ContractEventPayload, EventLog, WebSocketProvider } from 'ethers';
import { ETHEREUM_RPC_URL, ETH_CONTRACT_ADDRESS } from './config.js';
import { ETH_PINGER_ABI } from './types.js';
export let ethereumProvider = null;
export async function connectEthereum() {
    if (ethereumProvider)
        return ethereumProvider;
    ethereumProvider = new ethers.WebSocketProvider(ETHEREUM_RPC_URL);
    await ethereumProvider.getBlockNumber();
    console.log('✅ Connected to Ethereum (WS)!');
    return ethereumProvider;
}
export function listenPingFromEthereum(provider, onPing) {
    const contract = new ethers.Contract(ETH_CONTRACT_ADDRESS, ETH_PINGER_ABI, provider);
    contract.on('PingFromEthereum', (from, payload) => {
        onPing(from, payload.log);
    });
    console.log('🔔 Listening for PingFromEthereum at:', ETH_CONTRACT_ADDRESS);
}
