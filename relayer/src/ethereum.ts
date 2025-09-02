import { ethers, ContractEventPayload, EventLog, WebSocketProvider } from 'ethers';
import { ETHEREUM_WS_RPC_URL, ETH_CONTRACT_ADDRESS } from './config.js';
import { ETH_PINGER_ABI } from './types.js';

export let ethereumProvider: ethers.WebSocketProvider | null = null;

export async function connectEthereum(): Promise<ethers.WebSocketProvider> {
  if (ethereumProvider) return ethereumProvider;
  ethereumProvider = new ethers.WebSocketProvider(ETHEREUM_WS_RPC_URL);
  await ethereumProvider.getBlockNumber();
  console.log('✅ Connected to Ethereum (WS)!');
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
  console.log('🔔 Listening for PingFromEthereum at:', ETH_CONTRACT_ADDRESS);
}