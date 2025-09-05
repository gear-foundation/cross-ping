import {
  createPublicClient,
  createWalletClient,
  webSocket,
  type PublicClient,
  type WalletClient,
  type Log,
} from "viem";
import { hoodi } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import {
  ETHEREUM_WS_RPC_URL,
  ETH_CROSS_PING_CONTRACT_ADDRESS,
  PRIVATE_KEY,
  ENABLE_ETH_TO_VARA,
  ENABLE_VARA_TO_ETH,
} from "./config.js";
import { ETH_CROSS_PING_ABI } from "./api.js";

export let ethereumProvider: PublicClient | null = null;
export let ethereumWalletClient: WalletClient | null = null;
export let ethereumAccount: ReturnType<typeof privateKeyToAccount> | null =
  null;

// Public client for reading (used by both directions)
export async function connectEthereum(): Promise<PublicClient> {
  if (ethereumProvider) return ethereumProvider;

  ethereumProvider = createPublicClient({
    transport: webSocket(ETHEREUM_WS_RPC_URL),
  });

  await ethereumProvider.getBlockNumber();
  console.log("✅ Connected to Ethereum (WS)!");
  return ethereumProvider;
}

// Wallet client for signing transactions (Vara → Ethereum relay)
export function getEthereumWalletClient(): {
  walletClient: WalletClient;
  account: ReturnType<typeof privateKeyToAccount>;
} {
  if (!ENABLE_VARA_TO_ETH) {
    throw new Error("Vara → Ethereum relay not enabled");
  }

  if (!ethereumWalletClient || !ethereumAccount) {
    ethereumAccount = privateKeyToAccount(PRIVATE_KEY);
    ethereumWalletClient = createWalletClient({
      account: ethereumAccount,
      transport: webSocket(ETHEREUM_WS_RPC_URL),
    });
  }

  return {
    walletClient: ethereumWalletClient,
    account: ethereumAccount,
  };
}

// Ethereum → Vara relay: Listen for PingFromEthereum events
export function listenPingFromEthereum(
  client: PublicClient,
  onPing: (from: string, eventLog: Log) => void,
) {
  if (!ENABLE_ETH_TO_VARA) {
    console.log(
      "⏭️  Ethereum → Vara relay disabled, skipping PingFromEthereum listener",
    );
    return;
  }

  client.watchContractEvent({
    address: ETH_CROSS_PING_CONTRACT_ADDRESS,
    abi: ETH_CROSS_PING_ABI,
    eventName: "PingSent",
    onLogs: (logs) => {
      logs.forEach((log) => {
        if (log.args && "from" in log.args) {
          onPing(log.args.from as string, log);
        }
      });
    },
  });

  console.log(
    "🔔 Listening for PingFromEthereum at:",
    ETH_CROSS_PING_CONTRACT_ADDRESS,
  );
}
