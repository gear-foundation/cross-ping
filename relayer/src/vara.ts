import { GearApi } from '@gear-js/api';
import { Keyring } from '@polkadot/api';
import { Sails } from 'sails-js';
import { SailsIdlParser } from 'sails-js-parser';
import { VARA_RPC_URL, CHECKPOINT_LIGHT_CLIENT_IDL, CHECKPOINT_LIGHTH_CLIENT, HISTORICAL_PROXY_IDL, HISTORICAL_PROXY_ID, PING_RECEIVER_PROGRAM_ID, PING_RECEIVER_ROUTE, VARA_MNEMONIC_KEY} from './config';
import { routeToHex } from './helper'
import { PingMessage, NewCheckpointEvent } from './types';

export let varaProvider: GearApi | null = null;
export let sailsCheckpoint: Sails;
export let sailsHistorical: Sails;

export async function connectVara(): Promise<GearApi> {
  if (varaProvider) return varaProvider;

  varaProvider = await GearApi.create({ providerAddress: VARA_RPC_URL });

  // CheckpointLightClient program
  const parserCheckpoint = await SailsIdlParser.new();
  sailsCheckpoint = new Sails(parserCheckpoint);
  sailsCheckpoint.parseIdl(CHECKPOINT_LIGHT_CLIENT_IDL);
  sailsCheckpoint.setApi(varaProvider);
  sailsCheckpoint.setProgramId(CHECKPOINT_LIGHTH_CLIENT as `0x${string}`);

  // HistoricalProxy program
  const parserHistorical = await SailsIdlParser.new();
  sailsHistorical = new Sails(parserHistorical);
  sailsHistorical.parseIdl(HISTORICAL_PROXY_IDL);
  sailsHistorical.setApi(varaProvider);
  sailsHistorical.setProgramId(HISTORICAL_PROXY_ID as `0x${string}`);

  console.log('✅ Connected to Vara!');
  return varaProvider;
}

// create Vara keypair 
export function connectWallet() {
  const keyring = new Keyring({ type: 'sr25519' });
  const pair = keyring.addFromMnemonic(VARA_MNEMONIC_KEY);
  return pair
}

export async function listenForNewCheckpoint(sails: Sails, onNewCheckpoint: (event: NewCheckpointEvent) => void) {
  sailsCheckpoint.services.ServiceSyncUpdate.events.NewCheckpoint.subscribe((data: any) => {
      onNewCheckpoint({
        slot: data.slot,
        tree_hash_root: data.tree_hash_root,
      });
  });
}


export async function sendToHistoricalProxy(
  sailsHistorical: Sails,
  wallet: any,
  msg: PingMessage,
) {

  const slot = msg.slot;
  const proof = msg.proof
  const clientRoute = routeToHex(PING_RECEIVER_ROUTE);

  try {
    const trx = await sailsHistorical.services.HistoricalProxy.functions.Redirect(
      slot,
      proof,
      PING_RECEIVER_PROGRAM_ID,
      clientRoute
    )
    trx.withAccount(wallet);
    await trx.calculateGas();
    const result = await trx.signAndSend();

    console.log("✅ [HISTORICAL_PROXY] Message sent, result:", result);
  } catch(err) {
    console.error("❌ Error sending to Historical Proxy:", err);
    throw err;
  }

}

