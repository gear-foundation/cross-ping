const { ethers } = require("hardhat");

async function main() {
  const EthPinger = await ethers.getContractFactory("EthPinger");
  const ethPinger = await EthPinger.deploy();
  await ethPinger.waitForDeployment();
  const address = await ethPinger.getAddress();
  console.log(`✅ Eth Pinger deployed to: ${address}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
}); 