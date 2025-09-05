import { connectVara } from "./vara.js";
import { connectEthereum } from "./ethereum.js";
import { startEthToVaraRelay } from "./relayers/eth-to-vara.js";
import { startVaraToEthRelay } from "./relayers/vara-to-eth.js";
import { ENABLE_ETH_TO_VARA, ENABLE_VARA_TO_ETH } from "./config.js";

async function main() {
  console.log("🚀 Starting bidirectional cross-chain relayer...");
  console.log("═".repeat(60));

  // Connect to both networks
  const gearApi = await connectVara();
  const ethereumClient = await connectEthereum();

  // Start enabled relay directions
  const relayPromises: Promise<void>[] = [];

  if (ENABLE_ETH_TO_VARA) {
    relayPromises.push(startEthToVaraRelay(gearApi, ethereumClient));
  }

  if (ENABLE_VARA_TO_ETH) {
    relayPromises.push(startVaraToEthRelay(gearApi, ethereumClient));
  }

  // Wait for all relays to be set up
  await Promise.all(relayPromises);

  console.log("═".repeat(60));
  console.log(
    "🎯 Relayer is running and listening for cross-chain messages...",
  );
  console.log("   Press Ctrl+C to stop");
  console.log("═".repeat(60));
}

main().catch((e) => {
  console.error("💥 Fatal error:", e);
  process.exit(1);
});
