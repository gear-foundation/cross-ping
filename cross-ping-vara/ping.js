import { GearApi } from "@gear-js/api";
import { Keyring } from "@polkadot/api";
import { Sails } from "sails-js";
import { SailsIdlParser } from "sails-js-parser";
import * as fs from "fs";
import { config } from "dotenv";

config();

const CROSS_PING_ID = process.env.CROSS_PING_ID;
const ETH_CROSS_PING_CONTRACT_ADDRESS =
  process.env.ETH_CROSS_PING_CONTRACT_ADDRESS;
const VARA_RPC_URL = process.env.VARA_RPC_URL;
const VARA_MNEMONIC = process.env.VARA_MNEMONIC;

const IDL = fs.readFileSync("./cross_ping.idl", "utf8");

async function main() {
  const keyring = new Keyring({ type: "sr25519" });

  const api = await GearApi.create({
    providerAddress: VARA_RPC_URL,
    noInitWarn: true,
  });
  console.log("Connected to Gear node:", api.genesisHash.toHex());

  const sailsParser = await SailsIdlParser.new();
  const sails = new Sails(sailsParser).parseIdl(IDL);

  const account = keyring.addFromMnemonic(VARA_MNEMONIC);

  console.log(`Account address: ${account.address}`);

  console.log(`Destination: ${ETH_CROSS_PING_CONTRACT_ADDRESS}`);

  const payload = sails.services.Sender.functions.SendPing.encodePayload(
    ETH_CROSS_PING_CONTRACT_ADDRESS,
  );

  const tx = api.message.send({
    destination: CROSS_PING_ID,
    gasLimit: api.blockGasLimit,
    payload,
  });

  await new Promise((resolve, reject) =>
    tx
      .signAndSend(account, ({ status, events }) => {
        if (status.isInBlock) {
          const mq = events.find(
            ({ event: { method } }) => method === "MessageQueued",
          );

          if (!mq) {
            reject("Failed to send message");
          } else {
            resolve(
              `Message sent in block ${status.asInBlock.toHex()} with id ${mq.event.data.id.toHex()}`,
            );
          }
        }
      })
      .catch((error) => {
        reject(error);
      }),
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
