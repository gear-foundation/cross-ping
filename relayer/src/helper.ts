import { MerkleTree } from 'merkletreejs';
import { createHash } from 'crypto';

/**
 * --- BACON IDL SCHEMA ---
 * These are minimal interface definitions for block normalization.
 * Each string value indicates the field type used for serialization.
 */
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
  blob_kzg_commitments: "merkle", // Each commitment is 48 bytes (BLS12-381 G1)
};

const BlockGeneric_IDL = {
  slot: "number",
  proposer_index: "number",
  parent_root: "bytes32",
  state_root: "bytes32",
  body: BlockBody_IDL,
};

/**
 * SSZ-compatible SHA256 hasher.
 */
const sha256 = (data: Buffer) => createHash('sha256').update(data).digest();

/**
 * Calculate a Merkle root (SSZ-style) from a list of leaves (32 or 48 bytes each).
 * For arrays of one element, just returns that element.
 */
function merkleRootOfLeaves(leaves: Buffer[]): Buffer {
  if (!leaves?.length) return Buffer.alloc(32);
  if (leaves.length === 1) return leaves[0];
  const tree = new MerkleTree(leaves, sha256, { sort: true });
  return tree.getRoot();
}

/**
 * Calculates the SSZ tree hash root for any input value, supporting:
 * - Buffers (32 bytes, or left-padded to 32)
 * - Hex strings (0x..., single or multiple concatenated elements)
 * - Arrays (recursively hashed)
 * - Objects (sorted by key and recursively hashed)
 * - Numbers/bigints (converted to 32-byte big-endian hex)
 * Similar to Rust implementation:
 *   https://docs.rs/tree_hash/latest/tree_hash/
 *   https://github.com/sigp/lighthouse/tree/master/common/tree_hash
 */
function sszTreeHashRoot(val: any): Buffer {
  // Null/undefined -> 32 zero bytes
  if (val == null) return Buffer.alloc(32);

  // If Buffer, pad to 32 bytes
  if (Buffer.isBuffer(val)) return val.length === 32 ? val : Buffer.concat([Buffer.alloc(32 - val.length), val]);

  // Handle hex strings (could be 32 or 48-byte elements, or padded values)
  if (typeof val === 'string') {
    let hex = val.startsWith('0x') ? val.slice(2) : val;

    // Single 32-byte element
    if (hex.length === 64) return Buffer.from(hex, 'hex');

    // Special case: array of 48-byte elements (e.g. KZG commitments, BLS signatures)
    if (hex.length % 96 === 0) {
      let chunks: Buffer[] = [];
      for (let i = 0; i < hex.length; i += 96) {
        chunks.push(Buffer.from(hex.slice(i, i + 96), 'hex'));
      }
      return merkleRootOfLeaves(chunks); // SSZ Merkle root is always 32 bytes
    }

    // Case: array of 32-byte elements (e.g. H256 array)
    if (hex.length % 64 === 0) {
      let chunks: Buffer[] = [];
      for (let i = 0; i < hex.length; i += 64) {
        chunks.push(Buffer.from(hex.slice(i, i + 64), 'hex'));
      }
      return merkleRootOfLeaves(chunks);
    }

    // Otherwise, pad to 32 bytes (big-endian)
    return Buffer.from(hex.padStart(64, '0'), 'hex');
  }

  // Recursively handle arrays
  if (Array.isArray(val)) {
    const leaves = val.map(sszTreeHashRoot);
    return merkleRootOfLeaves(leaves);
  }

  // Recursively handle objects (sort keys for deterministic hash, like SSZ struct)
  if (typeof val === 'object') {
    const leaves = Object.keys(val).sort().map(k => sszTreeHashRoot(val[k]));
    return merkleRootOfLeaves(leaves);
  }

  // Handle numbers/bigints (convert to 32-byte big-endian buffer)
  if (typeof val === 'number' || typeof val === 'bigint') {
    let hex = BigInt(val).toString(16).padStart(64, '0');
    return Buffer.from(hex, 'hex');
  }

  throw new Error('Cannot convert to bytes32/ssz root: ' + JSON.stringify(val));
}

// Converts Buffer or Uint8Array to 0x-prefixed hex string.
export function toHex(buf: Buffer | Uint8Array): string {
  return '0x' + Buffer.from(buf).toString('hex');
}

// Recursively normalize a JS object to match the given IDL, converting fields as needed

function normalizeToIDL(obj: any, idl: any): any {
  if (obj == null) return obj;
  const out: any = {};
  for (const [key, type] of Object.entries(idl)) {
    const val = obj[key];
    if (val == null) continue;
    if (typeof type === "object") {
      out[key] = normalizeToIDL(val, type);
    } else if (type === "merkle") {
      out[key] = toHex(sszTreeHashRoot(val));
    } else if (type === "bytelist") {
      out[key] = [{ data: val }];
    } else {
      out[key] = val;
    }
  }
  return out;
}

// Main normalization entrypoint: normalizes a beacon chain block into IDL-conforming structure.
export function normalizeBlock(jsBlock: any): any {
  return normalizeToIDL(jsBlock, BlockGeneric_IDL);
}

export function routeToHex(data: any): string {
  if (typeof data === "string" && data.startsWith("0x")) return data;
  if (typeof data === "string") return "0x" + Buffer.from(data, "utf8").toString("hex");
  if (data instanceof Uint8Array || Buffer.isBuffer(data)) return "0x" + Buffer.from(data).toString("hex");
  throw new Error("Unsupported type for routeToHex");
}