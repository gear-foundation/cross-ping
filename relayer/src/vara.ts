import { GearApi } from '@gear-js/api';
import { Keyring } from '@polkadot/api';
import { VARA_RPC_URL, VARA_MNEMONIC_KEY } from './config';

export let varaProvider: GearApi | null = null;

export async function connectVara(): Promise<GearApi> {
  if (varaProvider) return varaProvider;
  varaProvider = await GearApi.create({ providerAddress: VARA_RPC_URL });
  console.log('✅ Connected to Vara!');
  return varaProvider;
}

export function connectWallet() {
  const keyring = new Keyring({ type: 'sr25519' });
  const pair = keyring.addFromMnemonic(VARA_MNEMONIC_KEY);
  return pair;
}