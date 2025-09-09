import { createPublicClient, createWalletClient, http } from 'viem';
import { hoodi } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { ETHEREUM_HTTPS_RPC_URL, PRIVATE_KEY } from './config.js';

export const ethereumPublicClient = createPublicClient({
  chain: hoodi,
  transport: http(ETHEREUM_HTTPS_RPC_URL),
});

export const account = privateKeyToAccount(PRIVATE_KEY);

export const ethereumWalletClient = createWalletClient({
  account,
  chain: hoodi,
  transport: http(ETHEREUM_HTTPS_RPC_URL),
});