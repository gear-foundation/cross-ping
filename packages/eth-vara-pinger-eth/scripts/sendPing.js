require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const [signer] = await hre.ethers.getSigners();

  const abi = [
    "function ping() external"
  ];

  const ethPinger = new hre.ethers.Contract(contractAddress, abi, signer);

  const tx = await ethPinger.ping();
  console.log(`⏳ Tx sent: ${tx.hash}`);
  await tx.wait();
  console.log(`✅ Ping sent from: ${signer.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});