import { connectVara, connectWallet, varaProvider } from './vara.js';
import { connectEthereum, listenPingFromEthereum } from './ethereum.js';
import { ethers } from 'ethers';
import { relayEthToVara } from '@gear-js/bridge';
import { createPublicClient, http } from 'viem';
import { hoodi } from 'viem/chains';
import {
  ETHEREUM_HTTPS_RPC_URL,
  BEACON_API_URL,
  CHECKPOINT_LIGHT_CLIENT,
  HISTORICAL_PROXY_ID,
  PING_RECEIVER_PROGRAM_ID,
  PING_RECEIVER_SERVICE,
  PING_RECEIVER_METHOD,
} from './config.js';

// Main relayer function
async function main() {
  await connectVara();
  const ethApi = await connectEthereum();
  const wallet = connectWallet();

  const viemPublicClient = createPublicClient({
    chain: hoodi,
    transport: http(ETHEREUM_HTTPS_RPC_URL),
  });

  listenPingFromEthereum(ethApi, async (_from: string, event: ethers.EventLog) => {
    const txHash = event.transactionHash as `0x${string}`;
    console.log('🟢 new PingFromEthereum tx:', txHash);

    try {
      const res = await relayEthToVara({
        transactionHash: txHash,
        beaconRpcUrl: BEACON_API_URL,
        ethereumPublicClient: viemPublicClient,
        gearApi: varaProvider!,
        checkpointClientId: CHECKPOINT_LIGHT_CLIENT,
        historicalProxyId: HISTORICAL_PROXY_ID,
        clientId: PING_RECEIVER_PROGRAM_ID,
        clientServiceName: PING_RECEIVER_SERVICE,
        clientMethodName: PING_RECEIVER_METHOD,
        signer: wallet,
        wait: true,
        statusCb: (status, details) => {
          console.log(`[Relay] [Status]`, status, details);
        }
      });

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