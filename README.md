

# `@ubiquity/rpc-handler`

`RpcHandler` is a TypeScript class designed to manage RPC (Remote Procedure Call) endpoints for different blockchain networks. It intelligently selects the fastest available RPC endpoint for a given chain and handles request failures gracefully by retrying with alternative endpoints.

## Features

- **Dynamic RPC Selection**: Automatically finds the fastest RPC endpoint for a specified blockchain network.
- **Caching**: Caches the fastest RPC endpoints to improve performance on subsequent requests.
- **Graceful Failover**: Handles failed requests by trying alternative RPC endpoints.
- **Environment Compatibility**: Supports both browser and Node.js environments with appropriate storage mechanisms.

## Installation

You can install this package using the `bun` package manager:

```bash
bun add @ubiquity/rpc-handler
```


## Usage

```typescript
import { RpcHandler } from "@ubiquity/rpc-handler";

// Assuming you have chain data available
const chainDataArray: ChainData[] = [
  {
    name: "Ethereum Mainnet",
    chain: "ETH",
    rpc: ["https://mainnet.infura.io/v3/YOUR-PROJECT-ID", "https://eth-mainnet.alchemyapi.io/v2/YOUR-API-KEY", "https://cloudflare-eth.com"],
    chainId: 1,
    // ... other ChainData properties
  },
  // Add other chains as needed
];

const rpcHandler = new RpcHandler(chainDataArray);

// Sending an RPC request
const payload = {
  jsonrpc: "2.0",
  method: "eth_blockNumber",
  params: [],
  id: 1,
};

rpcHandler
  .sendRequest(1, payload)
  .then((response) => {
    console.log("Block Number:", response.result);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
```

## API Reference

### `RpcHandler`

#### Constructor

```typescript
new RpcHandler(chainData: ChainData[])
```

- `chainData`: An array of `ChainData` objects representing different blockchain networks and their RPC endpoints.

#### Methods

##### `sendRequest(chainId: number, payload: Record<string, unknown>): Promise<Record<string, unknown>>`

Sends an RPC request to the fastest available endpoint for the specified chain ID.

- `chainId`: The ID of the blockchain network.
- `payload`: The RPC request payload.

Returns a promise that resolves with the RPC response.

## Interfaces

### `ChainData`

Represents the data for a blockchain network.

```typescript
interface ChainData {
  name: string;
  chain: string;
  rpc: string[];
  chainId: number;
  // Optional properties
  icon?: string;
  features?: Feature[];
  faucets?: string[];
  nativeCurrency?: Currency;
  infoURL?: string;
  shortName?: string;
  networkId?: number;
  slip44?: number;
  ens?: { registry: string };
  explorers?: Explorer[];
  title?: string;
  status?: string;
  redFlags?: string[];
  parent?: ParentChain;
}
```

### `Feature`

Represents a feature of the blockchain network.

```typescript
interface Feature {
  name: string;
}
```

### `Currency`

Represents the native currency of the blockchain network.

```typescript
interface Currency {
  name: string;
  symbol: string;
  decimals: number;
}
```

### `Explorer`

Represents an explorer for the blockchain network.

```typescript
interface Explorer {
  name: string;
  url: string;
  standard: string;
  icon?: string;
}
```

### `ParentChain`

Represents the parent chain information for networks that are sidechains or layer 2 solutions.

```typescript
interface ParentChain {
  type: string;
  chain: string;
  bridges: { url: string }[];
}
```

## Storage Mechanisms

The `RpcHandler` class uses a storage mechanism to cache the fastest RPC endpoints. It supports both browser and Node.js environments:

- **Browser**: Uses `localStorage` via the `BrowserStorage` class.
- **Node.js**: Uses an in-memory storage via the `NodeStorage` class.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with your changes.

## License

This project is licensed under the MIT License.
