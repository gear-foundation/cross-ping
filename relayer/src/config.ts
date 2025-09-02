import { config } from 'dotenv';
config();

const REQUIRED = [
  'ETHEREUM_HTTPS_RPC_URL',
  'BEACON_API_URL',
  'VARA_RPC_URL',
  'CHECKPOINT_LIGHT_CLIENT',
  'HISTORICAL_PROXY_ID',
  'PING_RECEIVER_PROGRAM_ID',
  'VARA_MNEMONIC_KEY',
  'ETH_CONTRACT_ADDRESS'
];

for (const k of REQUIRED) {
  if (!process.env[k]) throw new Error(`Missing env ${k}`);
}

export const VARA_RPC_URL = process.env.VARA_RPC_URL as string;

export const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL || '';
export const ETHEREUM_HTTPS_RPC_URL = process.env.ETHEREUM_HTTPS_RPC_URL as string;
export const BEACON_API_URL = process.env.BEACON_API_URL as string;

export const CHECKPOINT_LIGHT_CLIENT = process.env.CHECKPOINT_LIGHT_CLIENT as `0x${string}`;
export const HISTORICAL_PROXY_ID = process.env.HISTORICAL_PROXY_ID as `0x${string}`;
export const PING_RECEIVER_PROGRAM_ID = process.env.PING_RECEIVER_PROGRAM_ID as `0x${string}`;

export const PING_RECEIVER_SERVICE = 'PingReceiver';
export const PING_RECEIVER_METHOD = 'SubmitReceipt';

export const VARA_MNEMONIC_KEY = process.env.VARA_MNEMONIC_KEY as string;

export const ETH_CONTRACT_ADDRESS = process.env.ETH_CONTRACT_ADDRESS as `0x${string}`;
