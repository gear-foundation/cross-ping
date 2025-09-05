import { GearApi } from "@gear-js/api";
import { Keyring } from "@polkadot/api";
import { Sails } from "sails-js";
import { SailsIdlParser } from "sails-js-parser";
import {
  VARA_RPC_URL,
  VARA_MNEMONIC_KEY,
  ENABLE_ETH_TO_VARA,
  ENABLE_VARA_TO_ETH,
  VARA_CROSS_PING_PROGRAM_ID,
} from "./config.js";
import { VARA_CROSS_PING_IDL, type PingSentEvent } from "./api.js";

type Hex = `0x${string}`;

let varaProvider: GearApi | null = null;
let sails: Sails | null = null;

// For Vara → Ethereum relay: track pending events
const pending = new Map<Hex, bigint>();
const earlyBridgeEvents = new Map<Hex, bigint>();
let pingSentListener: ((e: PingSentEvent) => void) | null = null;

// Common Vara connection (used by both directions)
export async function connectVara(): Promise<GearApi> {
  if (varaProvider) return varaProvider;

  varaProvider = await GearApi.create({
    providerAddress: VARA_RPC_URL,
    noInitWarn: true,
  });
  console.log("✅ Connected to Vara!");

  // Set up Sails for Vara → Ethereum relay if enabled
  if (ENABLE_VARA_TO_ETH) {
    await setupSailsForVaraToEth();
    subscribeToBridgeEvents();
  }

  return varaProvider;
}

// Ethereum → Vara relay: Get wallet for signing transactions
export function connectWallet() {
  if (!ENABLE_ETH_TO_VARA) {
    throw new Error("Ethereum → Vara relay not enabled");
  }

  const keyring = new Keyring({ type: "sr25519" });
  const pair = keyring.addFromMnemonic(VARA_MNEMONIC_KEY);
  return pair;
}

// Vara → Ethereum relay: Set up Sails parser
async function setupSailsForVaraToEth(): Promise<void> {
  const parser = await SailsIdlParser.new();
  sails = new Sails(parser);
  sails.parseIdl(VARA_CROSS_PING_IDL);
  sails.setApi(varaProvider!);
  sails.setProgramId(VARA_CROSS_PING_PROGRAM_ID);

  console.log("✅ Sails configured for CrossPing program");
}

// Vara → Ethereum relay: Subscribe to bridge events
function subscribeToBridgeEvents() {
  console.log("[Bridge] Subscribed to gearEthBridge::MessageQueued");

  varaProvider!.query.system.events(async (events: any) => {
    const blockHash = events.createdAtHash?.toHex();
    if (!blockHash) return;

    const bridgeEvents = events.filter(
      ({ event }: any) =>
        event.section === "gearEthBridge" && event.method === "MessageQueued",
    );

    if (bridgeEvents.length === 0) return;

    const blockNumber = BigInt(
      (await varaProvider!.blocks.getBlockNumber(blockHash)).toString(),
    );

    for (const { event } of bridgeEvents) {
      const hash = event.data[1].toHex().toLowerCase() as Hex;

      if (pending.has(hash)) {
        const nonce = pending.get(hash)!;
        pending.delete(hash);
        console.log(`[Bridge] MQ matched: hash=${hash}, block=${blockNumber}`);
        pingSentListener?.({ nonce, messageHash: hash, blockNumber });
      } else {
        earlyBridgeEvents.set(hash, blockNumber);
      }
    }
  });
}

// Vara → Ethereum relay: Listen for PingSent events
export function listenPingSent(cb: (e: PingSentEvent) => void) {
  if (!ENABLE_VARA_TO_ETH) {
    console.log(
      "⏭️  Vara → Ethereum relay disabled, skipping PingSent listener",
    );
    return;
  }

  if (!sails) {
    throw new Error("Sails not initialized. Call connectVara() first.");
  }

  pingSentListener = cb;

  sails.services.Sender.events.PingSent.subscribe((data: any) => {
    const msgHash = (data.message_hash as string).toLowerCase() as Hex;
    const nonce = BigInt(data.nonce);

    if (earlyBridgeEvents.has(msgHash)) {
      const blockNumber = earlyBridgeEvents.get(msgHash)!;
      earlyBridgeEvents.delete(msgHash);
      console.log(`[PingSent] Immediate MQ match for ${msgHash}`);
      cb({ nonce, messageHash: msgHash, blockNumber });
    } else {
      pending.set(msgHash, nonce);
      console.log(
        `[PingSent] Received hash=${msgHash}, nonce=${nonce} — waiting for MQ`,
      );
    }
  });

  console.log("🔔 Listening for PingSent events on CrossPing program");
}
