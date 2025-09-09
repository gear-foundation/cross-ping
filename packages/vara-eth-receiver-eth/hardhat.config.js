import 'dotenv/config';
import '@nomicfoundation/hardhat-ethers';

export default {
  solidity: '0.8.24',
  networks: {
    hoodi: {
      url: process.env.RPC_URL || '',
      accounts: process.env.PRIVATE_KEY
        ? [process.env.PRIVATE_KEY.startsWith('0x') ? process.env.PRIVATE_KEY : `0x${process.env.PRIVATE_KEY}`]
        : []
    }
  }
};
