import { config } from "dotenv";

config();

// ============================================================================
// ENVIRONMENT VARIABLE DEFINITIONS
// ============================================================================

const COMMON_REQUIRED = ["VARA_RPC_URL", "ETHEREUM_WS_RPC_URL"] as const;

const ETH_TO_VARA_REQUIRED = [
  "VARA_MNEMONIC_KEY",
  "CHECKPOINT_LIGHT_CLIENT",
  "HISTORICAL_PROXY_ID",
  "VARA_CROSS_PING_ID",
  "ETH_CROSS_PING_ADDR",
  "BEACON_API_URL",
] as const;

const VARA_TO_ETH_REQUIRED = [
  "VARA_CROSS_PING_ID",
  "MESSAGE_QUEUE_PROXY_ADDRESS",
  "PRIVATE_KEY",
] as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function checkRequiredVars(vars: readonly string[], context: string): void {
  for (const envVar of vars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing env ${envVar} for ${context}`);
    }
  }
}

// ============================================================================
// CONFIGURATION VALIDATION
// ============================================================================

// Validate common required variables
checkRequiredVars(COMMON_REQUIRED, "basic functionality");

// Determine which relay directions are enabled
export const ENABLE_ETH_TO_VARA = ETH_TO_VARA_REQUIRED.every(
  (key) => process.env[key],
);

export const ENABLE_VARA_TO_ETH = VARA_TO_ETH_REQUIRED.every(
  (key) => process.env[key],
);

// Ensure at least one direction is configured
if (!ENABLE_ETH_TO_VARA && !ENABLE_VARA_TO_ETH) {
  throw new Error(
    "At least one relay direction must be configured. " +
      "Please provide environment variables for either Ethereum → Vara or Vara → Ethereum relay.",
  );
}

// Validate direction-specific variables
if (ENABLE_ETH_TO_VARA) {
  checkRequiredVars(ETH_TO_VARA_REQUIRED, "Ethereum → Vara relay");
}

if (ENABLE_VARA_TO_ETH) {
  checkRequiredVars(VARA_TO_ETH_REQUIRED, "Vara → Ethereum relay");
}

// Log enabled directions
console.log("🔄 Relay directions enabled:");
if (ENABLE_ETH_TO_VARA) console.log("  ✅ Ethereum → Vara");
if (ENABLE_VARA_TO_ETH) console.log("  ✅ Vara → Ethereum");

// ============================================================================
// COMMON CONFIGURATION
// ============================================================================

export const VARA_RPC_URL = getRequiredEnv("VARA_RPC_URL");
export const ETHEREUM_WS_RPC_URL = getRequiredEnv("ETHEREUM_WS_RPC_URL");

export const VARA_CROSS_PING_PROGRAM_ID = process.env
  .VARA_CROSS_PING_ID as `0x${string}`;
export const ETH_CROSS_PING_CONTRACT_ADDRESS = process.env
  .ETH_CROSS_PING_ADDR as `0x${string}`;
// ============================================================================
// ETHEREUM → VARA RELAY CONFIGURATION
// ============================================================================

export const VARA_MNEMONIC_KEY = process.env.VARA_MNEMONIC_KEY as string;
export const CHECKPOINT_LIGHT_CLIENT = process.env
  .CHECKPOINT_LIGHT_CLIENT as `0x${string}`;
export const HISTORICAL_PROXY_ID = process.env
  .HISTORICAL_PROXY_ID as `0x${string}`;

export const BEACON_API_URL = process.env.BEACON_API_URL as string;
export const PING_RECEIVER_SERVICE = "Receiver" as const;
export const PING_RECEIVER_METHOD = "SubmitReceipt" as const;

// ============================================================================
// VARA → ETHEREUM RELAY CONFIGURATION
// ============================================================================

export const MESSAGE_QUEUE_PROXY_ADDRESS = process.env
  .MESSAGE_QUEUE_PROXY_ADDRESS as `0x${string}`;
export const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
