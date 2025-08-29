import { connectVara, connectWallet, varaProvider } from './vara';
import { connectEthereum, listenPingFromEthereum } from './ethereum';
import { ethers } from 'ethers';
import { relayEthToVara } from '@gear-js/bridge';
import { createPublicClient, http } from 'viem';
import {
  ETHEREUM_HTTPS_RPC_URL,
  BEACON_API_URL,
  CHECKPOINT_LIGHT_CLIENT,
  HISTORICAL_PROXY_ID,
  PING_RECEIVER_PROGRAM_ID,
  PING_RECEIVER_SERVICE,
  PING_RECEIVER_METHOD,
} from './config';

// Main relayer function
async function main() {
  await connectVara();
  const ethApi = await connectEthereum();
  const wallet = connectWallet();

  // Viem public client for proof/relay
  const viemPublicClient = createPublicClient({
    transport: http(ETHEREUM_HTTPS_RPC_URL),
  });

  listenPingFromEthereum(ethApi, async (_from: string, event: ethers.EventLog) => {
    const txHash = event.transactionHash as `0x${string}`;
    console.log('🟢 new PingFromEthereum tx:', txHash);

    try {
      const res = await relayEthToVara(
        txHash,
        BEACON_API_URL,
        viemPublicClient,
        varaProvider!,
        CHECKPOINT_LIGHT_CLIENT,
        HISTORICAL_PROXY_ID,
        PING_RECEIVER_PROGRAM_ID,
        PING_RECEIVER_SERVICE,
        PING_RECEIVER_METHOD,
        wallet
      );

      console.log('🚀 Relayed Vara tx:', res.txHash, 'msgId:', res.msgId);
      if (res.error) console.error('⚠️ Proxy error:', res.error);
      const finalized = await res.isFinalized;
      console.log('✅ Finalized:', finalized);
    } catch (e) {
      console.error('❌ relayEthToVara failed:', e);
    }
  });

  console.log('\n🚀 Relayer is running and listening for Pings from Ethereum...');
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});