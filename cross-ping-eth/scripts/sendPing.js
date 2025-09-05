import { config } from "dotenv";
import hre from "hardhat";

config();

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const publicClient = await hre.viem.getPublicClient();
  const [walletClient] = await hre.viem.getWalletClients();

  const abi = [
    {
      inputs: [],
      name: "sendPing",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  const ethPinger = await hre.viem.getContractAt("CrossPing", contractAddress);

  const hash = await ethPinger.write.sendPing();
  console.log(`⏳ Tx sent: ${hash}`);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log(`✅ Ping sent from: ${walletClient.account.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
