// Utility functions placeholder

export const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function assertHex32(h: string, name = 'value') {
  if (!/^0x[0-9a-fA-F]{64}$/.test(h)) {
    throw new Error(`Invalid ${name}: expected 0x + 32 bytes hex`);
  }
}