import { relayVaraToEth } from '@gear-js/bridge';
import { connectVara, listenPingSent } from './vara.js';
import { ethereumPublicClient, ethereumWalletClient, account } from './ethereum.js';
import { MESSAGE_QUEUE_PROXY_ADDRESS } from './config.js';

async function main() {
  const gearApi = await connectVara();

  await listenPingSent(async ({ nonce, blockNumber, messageHash }) => {
    console.log(`[Relay] PingSent: nonce=${nonce}, block=${blockNumber}, hash=${messageHash}`);

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
          console.log(`[Relay] [Status]`, status, details);
        }
      });

      if (result.error) {
        console.error(`[Relay] ❌ Error:`, result.error);
      } else {
        console.log(`[Relay] ✅ Success: txHash=${result.transactionHash}`);
      }
    } catch (err) {
      console.error(`[Relay] ❌ Exception:`, err);
    }
  });
}

main().catch((e) => {
  console.error(`[Relay] ❌ Fatal:`, e);
  process.exit(1);
});