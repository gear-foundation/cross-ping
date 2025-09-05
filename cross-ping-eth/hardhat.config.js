import "@nomicfoundation/hardhat-viem";
import { config } from "dotenv";

config();

export default {
  solidity: "0.8.28",
  networks: {
    hoodi: {
      url: process.env.RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};
