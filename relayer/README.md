# Bidirectional Cross-Chain Relayer

This is the unified bidirectional relayer for the Vara ↔ Ethereum Cross-Chain Ping example. It supports both relay directions:

- **Ethereum → Vara**: Listens for `PingFromEthereum` events on Ethereum and relays them to Vara
- **Vara → Ethereum**: Listens for `PingSent` events on Vara and relays them to Ethereum

## Features

✅ **Bidirectional relay support** - Both Ethereum→Vara and Vara→Ethereum  
✅ **Flexible configuration** - Enable one or both directions via environment variables  
✅ **Viem-based** - Modern Ethereum interactions using viem library  
✅ **Event coordination** - Sophisticated handling of PingSent and MessageQueued events  
✅ **Comprehensive logging** - Clear status tracking for both relay directions  
✅ **Error handling** - Robust error handling and recovery  

## Architecture

```
relayer/
├── src/
│   ├── main.ts              # Bidirectional entry point
│   ├── config.ts            # Unified configuration
│   ├── ethereum.ts          # Ethereum clients (public + wallet)
│   ├── vara.ts              # Vara connection + both event listeners
│   ├── relayers/
│   │   ├── eth-to-vara.ts   # Ethereum → Vara relay logic
│   │   └── vara-to-eth.ts   # Vara → Ethereum relay logic
│   └── types.ts             # Type definitions
└── package.json             # Dependencies and scripts
```

## Environment Variables

### Common (Required)
```env
VARA_RPC_URL=wss://testnet.vara.network
ETHEREUM_WS_RPC_URL=wss://reth-rpc.gear-tech.io/ws  
ETHEREUM_HTTPS_RPC_URL=https://reth-rpc.gear-tech.io
```

### Ethereum → Vara Relay
```env
VARA_MNEMONIC_KEY=your_vara_mnemonic_here
CHECKPOINT_LIGHT_CLIENT=0x...
HISTORICAL_PROXY_ID=0x...
PING_RECEIVER_PROGRAM_ID=0x...
ETH_CONTRACT_ADDRESS=0x...
BEACON_API_URL=https://...
```

### Vara → Ethereum Relay  
```env
CROSS_PING_PROGRAM_ID=0x...
MESSAGE_QUEUE_PROXY_ADDRESS=0x...
PRIVATE_KEY=0x...
```

> **Note**: You can enable one or both relay directions by providing the corresponding environment variables. The relayer will automatically detect which directions are configured and enable them.

## Usage

### Install Dependencies
```bash
pnpm install
```

### Development
```bash
pnpm dev
```

### Production
```bash
pnpm build
pnpm start
```

### Clean Build
```bash
pnpm clean
pnpm build
```

## Relay Flow

### Ethereum → Vara
1. Listen for `PingFromEthereum` events on Ethereum contract
2. Extract transaction hash from event
3. Use `@gear-js/bridge` to relay message to Vara
4. Submit to PingReceiver program on Vara network

### Vara → Ethereum  
1. Listen for `PingSent` events on CrossPing program
2. Coordinate with `MessageQueued` events from gearEthBridge
3. Use `@gear-js/bridge` to relay message to Ethereum
4. Submit to MessageQueue contract on Ethereum

## Monitoring

The relayer provides comprehensive logging with prefixes:
- `[ETH→VARA]` - Ethereum to Vara relay logs
- `[VARA→ETH]` - Vara to Ethereum relay logs  
- `[Bridge]` - Bridge event coordination logs
- `[PingSent]` - Vara event processing logs
- `[Relay] [Status]` - Bridge library status updates

## Error Handling

- **Connection failures**: Automatic retry and reconnection
- **Missing transaction hashes**: Graceful error handling with logging
- **Bridge errors**: Detailed error reporting and status tracking
- **Event coordination**: Handles early/late event arrival patterns

## Requirements

- Node.js 18+ 
- TypeScript 5+
- Access to Vara and Ethereum networks
- Appropriate private keys/mnemonics for transaction signing