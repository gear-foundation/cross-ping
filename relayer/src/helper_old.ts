import { MerkleTree } from 'merkletreejs';
import { createHash } from 'crypto';
import { Buffer } from 'buffer';
import { compactAddLength } from '@polkadot/util';

function toBytes32(val: any): Buffer {
  if (val == null) return Buffer.alloc(32);
  if (typeof val === 'number' || typeof val === 'bigint') {
    let hex = BigInt(val).toString(16).padStart(64, '0');
    return Buffer.from(hex, 'hex');
  }
  if (typeof val === 'string') {
    let hex = val.startsWith('0x') ? val.slice(2) : val;
    return Buffer.from(hex.padStart(64, '0'), 'hex');
  }
  if (Buffer.isBuffer(val)) return val.length === 32 ? val : Buffer.concat([Buffer.alloc(32 - val.length), val]);
  if (val instanceof Uint8Array) return toBytes32(Buffer.from(val));
  throw new Error('Cannot convert to bytes32: ' + JSON.stringify(val));
}

function toByteList(val: any): Uint8Array {
  if (!val) return new Uint8Array();
  if (typeof val === 'string') {
    let hex = val.startsWith('0x') ? val.slice(2) : val;
    const bytes = new Uint8Array(Buffer.from(hex, 'hex'));
    return compactAddLength(bytes);

  }
  if (Buffer.isBuffer(val)) return val;
  if (val instanceof Uint8Array) return val;
  throw new Error('Cannot convert to bytelist: ' + JSON.stringify(val));
}

const sha256 = (data: Buffer) => createHash('sha256').update(data).digest();

function merkleRootOfLeaves(leaves: Buffer[]): Buffer {
  if (!leaves?.length) return Buffer.alloc(32);
  const tree = new MerkleTree(leaves, sha256, { sort: true });
  return tree.getRoot();
}

function merkleRootOfObject(obj: any): Buffer {
  if (Array.isArray(obj)) return merkleRootOfLeaves(obj.map(toBytes32OrMerkle));
  if (obj && typeof obj === 'object') {
    const leaves = Object.keys(obj).sort().map(k => toBytes32OrMerkle(obj[k]));
    return merkleRootOfLeaves(leaves);
  }
  return toBytes32(obj);
}

function toBytes32OrMerkle(val: any): Buffer {
  if (val == null) return Buffer.alloc(32);
  if (typeof val === 'object') return merkleRootOfObject(val);
  return toBytes32(val);
}

export function toHex(buf: Buffer | Uint8Array): string {
  return '0x' + Buffer.from(buf).toString('hex');
}

// --- BACON IDL SCHEMA --- //

const ExecutionPayload_IDL = {
  parent_hash: "bytes32",
  fee_recipient: "bytes32",
  state_root: "bytes32",
  receipts_root: "bytes32",
  logs_bloom: "merkle",
  prev_randao: "bytes32",
  block_number: "number",
  gas_limit: "number",
  gas_used: "number",
  timestamp: "number",
  extra_data: "bytelist",
  base_fee_per_gas: "bytes32",
  block_hash: "bytes32",
  transactions: "merkle",
  withdrawals: "merkle",
  blob_gas_used: "number",
  excess_blob_gas: "number",
};

const BlockBody_IDL = {
  randao_reveal: "merkle",
  eth1_data: "merkle",
  graffiti: "bytes32",
  proposer_slashings: "merkle",
  attester_slashings: "merkle",
  attestations: "merkle",
  deposits: "merkle",
  voluntary_exits: "merkle",
  sync_aggregate: "merkle",
  execution_payload: ExecutionPayload_IDL,
  bls_to_execution_changes: "merkle",
  blob_kzg_commitments: "merkle",
};

const BlockGeneric_IDL = {
  slot: "number",
  proposer_index: "number",
  parent_root: "bytes32",
  state_root: "bytes32",
  body: BlockBody_IDL,
};

const BlockHeader_IDL = {
  slot: "number",
  proposer_index: "number",
  parent_root: "bytes32",
  state_root: "bytes32",
  body_root: "bytes32",
};

// --- Core normalizer --- //

function normalizeToIDL(obj: any, idl: any): any {
  const out: any = {};
  for (const [key, type] of Object.entries(idl)) {
    const val = obj[key];
    if (val == null) continue;
    if (typeof type === "object") out[key] = normalizeToIDL(val, type);
    else if (type === "number") out[key] = typeof val === 'number' ? val : Number(val);
    else if (type === "bytes32") out[key] = toBytes32(val);
    else if (type === "bytelist") out[key] = toByteList(val);
    else if (type === "merkle") out[key] = merkleRootOfObject(val);
    else out[key] = val;
  }
  return out;
}

// --- Exported API --- //

export function normalizeBlock(jsBlock: any): any {
  return normalizeToIDL(jsBlock, BlockGeneric_IDL);
}

export function normalizeHeader(jsHeader: any): any {
  return normalizeToIDL(jsHeader, BlockHeader_IDL);
}

export function routeToHex(data: any): string {
  if (typeof data === "string" && data.startsWith("0x")) return data;
  if (typeof data === "string") return "0x" + Buffer.from(data, "utf8").toString("hex");
  if (data instanceof Uint8Array || Buffer.isBuffer(data)) return "0x" + Buffer.from(data).toString("hex");
  throw new Error("Unsupported type for routeToHex");
}