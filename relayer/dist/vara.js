import { GearApi } from '@gear-js/api';
import { Keyring } from '@polkadot/api';
import { VARA_RPC_URL, VARA_MNEMONIC_KEY } from './config.js';
export let varaProvider = null;
export async function connectVara() {
    if (varaProvider)
        return varaProvider;
    varaProvider = await GearApi.create({ providerAddress: VARA_RPC_URL });
    console.log('✅ Connected to Vara!');
    return varaProvider;
}
export function connectWallet() {
    const keyring = new Keyring({ type: 'sr25519' });
    const pair = keyring.addFromMnemonic(VARA_MNEMONIC_KEY);
    return pair;
}
