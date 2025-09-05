import { relayEthToVara } from "@gear-js/bridge";
import { type Log, type PublicClient } from "viem";
import { connectWallet } from "../vara.js";
import { listenPingFromEthereum } from "../ethereum.js";
import {
  BEACON_API_URL,
  CHECKPOINT_LIGHT_CLIENT,
  HISTORICAL_PROXY_ID,
  PING_RECEIVER_SERVICE,
  PING_RECEIVER_METHOD,
  VARA_CROSS_PING_PROGRAM_ID,
} from "../config.js";
import type { GearApi } from "@gear-js/api";

export async function startEthToVaraRelay(
  gearApi: GearApi,
  ethereumClient: PublicClient,
) {
  console.log("🚀 Starting Ethereum → Vara relay...");

  const wallet = connectWallet();

  listenPingFromEthereum(ethereumClient, async (_from: string, event: Log) => {
    const txHash = event.transactionHash;
    if (!txHash) {
      console.error("❌ No transaction hash found in event");
      return;
    }
    console.log("🟢 [ETH→VARA] New PingFromEthereum tx:", txHash);

    try {
      const res = await relayEthToVara({
        transactionHash: txHash,
        beaconRpcUrl: BEACON_API_URL,
        ethereumPublicClient: ethereumClient,
        gearApi,
        checkpointClientId: CHECKPOINT_LIGHT_CLIENT,
        historicalProxyId: HISTORICAL_PROXY_ID,
        clientId: VARA_CROSS_PING_PROGRAM_ID,
        clientServiceName: PING_RECEIVER_SERVICE,
        clientMethodName: PING_RECEIVER_METHOD,
        signer: wallet,
        wait: true,
        statusCb: (status, details) => {
          console.log(`[ETH→VARA] [Status]`, status, details || "");
        },
      });

      console.log(
        "🚀 [ETH→VARA] Relayed Vara tx:",
        res.txHash,
        "msgId:",
        res.msgId,
      );
      if (res.error) console.error("⚠️ [ETH→VARA] Proxy error:", res.error);
      const finalized = await res.isFinalized;
      console.log("✅ [ETH→VARA] Finalized:", finalized);
    } catch (e) {
      console.error("❌ [ETH→VARA] relayEthToVara failed:", e);
    }
  });
}
