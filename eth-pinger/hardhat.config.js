require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.24",
  networks: {
    holesky: {
      url: process.env.RPC_URL || "",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};