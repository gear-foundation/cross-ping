import { relayVaraToEth } from "@gear-js/bridge";
import { GearApi } from "@gear-js/api";
import type { PublicClient } from "viem";

import { listenPingSent } from "../vara.js";
import { getEthereumWalletClient } from "../ethereum.js";
import { MESSAGE_QUEUE_PROXY_ADDRESS } from "../config.js";

export async function startVaraToEthRelay(
  gearApi: GearApi,
  ethereumPublicClient: PublicClient,
) {
  console.log("🚀 Starting Vara → Ethereum relay...");

  const { walletClient: ethereumWalletClient, account } =
    getEthereumWalletClient();

  listenPingSent(async ({ nonce, blockNumber, messageHash }) => {
    console.log(
      `🟢 [VARA→ETH] PingSent: nonce=${nonce}, block=${blockNumber}, hash=${messageHash}`,
    );

    try {
      const result = await relayVaraToEth({
        nonce,
        blockNumber,
        ethereumPublicClient,
        ethereumWalletClient,
        ethereumAccount: account,
        gearApi,
        messageQueueAddress: MESSAGE_QUEUE_PROXY_ADDRESS,
        wait: true,
        statusCb: (status, details) => {
          console.log(`[VARA→ETH] [Status]`, status, details || "");
        },
      });

      if (result.error) {
        console.error(`❌ [VARA→ETH] Error:`, result.error);
      } else {
        console.log(`✅ [VARA→ETH] Success: txHash=${result.transactionHash}`);
      }
    } catch (err) {
      console.error(`❌ [VARA→ETH] Exception:`, err);
    }
  });
}
