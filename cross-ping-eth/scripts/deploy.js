import hre from "hardhat";

async function main() {
  const ethPinger = await hre.viem.deployContract("CrossPing");
  console.log(`✅ Eth Pinger deployed to: ${ethPinger.address}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
