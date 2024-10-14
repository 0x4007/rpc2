# `@ubiquity/rpc-handler`

`RpcHandler` is a TypeScript class designed to efficiently manage RPC (Remote Procedure Call) endpoints across various blockchain networks. It intelligently selects the fastest available RPC endpoint for a given chain, caches endpoints for performance optimization, and gracefully handles request failures by retrying with alternative endpoints.

## Features

- **Dynamic RPC Selection**: Automatically identifies and uses the fastest RPC endpoint for each blockchain network.
- **Caching Mechanism**: Stores the fastest RPC endpoints to enhance performance on subsequent requests.
- **Failover Handling**: On request failure, seamlessly retries with alternative endpoints.
- **Cross-Environment Support**: Compatible with both browser and Node.js environments, using appropriate storage mechanisms.

## Installation

Install the package using the `bun` package manager:

```bash
bun add @ubiquity/rpc-handler
```

## Usage

```typescript
import { RpcHandler, ChainData } from "@ubiquity/rpc-handler";

// Define your chain data
const chainDataArray: ChainData[] = [
  {
    name: "Ethereum Mainnet",
    chain: "ETH",
    rpc: ["https://mainnet.infura.io/v3/YOUR-PROJECT-ID", "https://eth-mainnet.alchemyapi.io/v2/YOUR-API-KEY", "https://cloudflare-eth.com"],
    chainId: 1,
    // Additional optional ChainData properties
  },
  // Include other chains as needed
];

// Initialize the RpcHandler
const rpcHandler = new RpcHandler(chainDataArray);

// Define your RPC request payload
const payload = {
  jsonrpc: "2.0",
  method: "eth_blockNumber",
  params: [],
  id: 1,
};

// Send the RPC request
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

- **Parameters**:
  - `chainData`: An array of `ChainData` objects representing different blockchain networks and their RPC endpoints.

#### Methods

##### `sendRequest`

```typescript
sendRequest(chainId: number, payload: Record<string, unknown>): Promise<Record<string, unknown>>
```

Sends an RPC request to the fastest available endpoint for the specified chain ID.

- **Parameters**:
  - `chainId`: The ID of the blockchain network.
  - `payload`: The RPC request payload as an object.
- **Returns**: A promise that resolves with the RPC response.

## Interfaces

### `ChainData`

Represents the data for a blockchain network.

```typescript
interface ChainData {
  name: string;
  chain: string;
  rpc: string[];
  chainId: number;
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

Represents the parent chain information for networks that are side chains or layer 2 solutions.

```typescript
interface ParentChain {
  type: string;
  chain: string;
  bridges: { url: string }[];
}
```

## Storage Mechanisms

The `RpcHandler` class uses a storage mechanism to cache the fastest RPC endpoints, optimizing performance for subsequent requests. It supports both browser and Node.js environments:

- **Browser**: Utilizes `localStorage` through the `BrowserStorage` class.
- **Node.js**: Employs an in-memory storage via the `NodeStorage` class.

## Contributing

We welcome contributions! If you have suggestions or encounter issues, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.

# Remarks

In the UI you can get my WXDAI balance on Gnosis Chain using the following values (network id, method, params). It was a quick experiment so don't mind the incorrect prefix regarding block number:

```
100

eth_call

[     {         "to": "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d",         "data": "0x70a082310000000000000000000000004007ce2083c7f3e18097aeb3a39bb8ec149a341d"     },     "latest" ]
```

<img width="545" alt="Screenshot 2024-10-11 at 06 35 25" src="https://github.com/user-attachments/assets/66eca3be-5419-49b1-82c8-5304e366dca5">
