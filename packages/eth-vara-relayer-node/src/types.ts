import type { Abi } from 'viem';

export const ETH_PINGER_ABI = [
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'address', name: 'from', type: 'address' }],
    name: 'PingFromEthereum',
    type: 'event',
  },
] as const satisfies Abi;