import { GearApi } from '@gear-js/api';
import { Sails } from 'sails-js';
import { SailsIdlParser } from 'sails-js-parser';
import { VARA_RPC_URL, CROSS_PING_IDL, CROSS_PING_PROGRAM_ID } from './config.js';

import type { PingSentEvent } from './types.js'

type Hex = `0x${string}`;

export let varaProvider: GearApi | null = null;
export let sails: Sails | null = null;

const pending = new Map<Hex, bigint>();
const earlyBridgeEvents = new Map<Hex, bigint>();
let listener: ((e: PingSentEvent) => void) | null = null;

/**
 * Подключаемся к Vara и настраиваем Sails и MQ-слежение
 */
export async function connectVara(): Promise<GearApi> {
  if (varaProvider) return varaProvider;

  varaProvider = await GearApi.create({ providerAddress: VARA_RPC_URL });

  const parser = await SailsIdlParser.new();
  sails = new Sails(parser);
  sails.parseIdl(CROSS_PING_IDL);
  sails.setApi(varaProvider);
  sails.setProgramId(CROSS_PING_PROGRAM_ID);

  console.log('✅ Connected to Vara');

  subscribeToBridgeEvents();

  return varaProvider;
}

function subscribeToBridgeEvents() {
  console.log('[Bridge] Subscribed to gearEthBridge::MessageQueued');

  varaProvider!.query.system.events(async (events: any) => {
    const blockHash = events.createdAtHash?.toHex();
    if (!blockHash) return;

    const bridgeEvents = events.filter(
      ({ event }: any) => event.section === 'gearEthBridge' && event.method === 'MessageQueued'
    );

    if (bridgeEvents.length === 0) return;

    const blockNumber = BigInt((await varaProvider!.blocks.getBlockNumber(blockHash)).toString());

    for (const { event } of bridgeEvents) {
      const hash = event.data[1].toHex().toLowerCase() as Hex;

      if (pending.has(hash)) {
        const nonce = pending.get(hash)!;
        pending.delete(hash);
        console.log(`[Bridge] MQ matched: hash=${hash}, block=${blockNumber}`);
        listener?.({ nonce, messageHash: hash, blockNumber });
      } else {
        earlyBridgeEvents.set(hash, blockNumber);
      }
    }
  });
}

export function listenPingSent(cb: (e: PingSentEvent) => void) {
  listener = cb;

  sails!.services.CrossPing.events.PingSent.subscribe((data: any) => {
    const msgHash = (data.message_hash as string).toLowerCase() as Hex;
    const nonce = BigInt(data.nonce);

    if (earlyBridgeEvents.has(msgHash)) {
      const blockNumber = earlyBridgeEvents.get(msgHash)!;
      earlyBridgeEvents.delete(msgHash);
      console.log(`[PingSent] Immediate MQ match for ${msgHash}`);
      cb({ nonce, messageHash: msgHash, blockNumber });
    } else {
      pending.set(msgHash, nonce);
      console.log(`[PingSent] Received hash=${msgHash}, nonce=${nonce} — waiting for MQ`);
    }
  });
}