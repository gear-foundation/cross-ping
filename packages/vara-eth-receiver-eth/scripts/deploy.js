import hre from 'hardhat';
const { ethers } = hre;

async function main() {
  const PingReceiver = await ethers.getContractFactory('PingReceiver');
  const pingReceiver = await PingReceiver.deploy();
  await pingReceiver.waitForDeployment();
  console.log('✅ PingReceiver deployed to:', await pingReceiver.getAddress());
}

main().catch((e) => (console.error('❌ Deployment failed:', e), process.exitCode = 1));