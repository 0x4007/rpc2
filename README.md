# `@0x4007/ubiquity-rpc-provider`

`UbiquityRpcProvider` is a TypeScript class designed to efficiently manage RPC (Remote Procedure Call) endpoints across various blockchain networks. It intelligently selects the fastest available RPC endpoint for a given chain, caches endpoints for performance optimization, and gracefully handles request failures by retrying with alternative endpoints.

## Features

- **Dynamic RPC Selection**: Automatically identifies and uses the fastest RPC endpoint for each blockchain network.
- **Caching Mechanism**: Stores the fastest RPC endpoints to enhance performance on subsequent requests.
- **Failover Handling**: On request failure, seamlessly retries with alternative endpoints.
- **Cross-Environment Support**: Compatible with both browser and Node.js environments, using appropriate storage mechanisms.
- **Latency Check**: Performs latency checks to determine the fastest RPC endpoint.
- **Hex Result Conversion**: Automatically converts small hex string results to numbers for convenience.

## Installation

Install the package using the `bun` package manager:

```bash
bun add @0x4007/ubiquity-rpc-provider
```

## Usage

```typescript
import { UbiquityRpcProvider } from "@0x4007/ubiquity-rpc-provider";

// Initialize the UbiquityRpcProvider
const ubiquityRpcProvider = new UbiquityRpcProvider();

// Define your RPC request payload
const payload = {
  method: "eth_blockNumber",
  params: [],
};

// Send the RPC request
ubiquityRpcProvider
  .sendRequest(1, payload)
  .then((response) => {
    console.log("Block Number:", response.result);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
```

## API Reference

### `UbiquityRpcProvider`

#### Constructor

```typescript
new UbiquityRpcProvider(chainData?: ChainData[])
```

- **Parameters**:
  - `chainData` (optional): An array of `ChainData` objects representing different blockchain networks and their RPC endpoints. If not provided, it uses a default set of chains.

#### Methods

##### `sendRequest`

```typescript
sendRequest(chainId: number, payload: { method: string; params: unknown[] }): Promise<JsonRpcResponse>
```

Sends an RPC request to the fastest available endpoint for the specified chain ID.

- **Parameters**:
  - `chainId`: The ID of the blockchain network.
  - `payload`: An object containing the RPC method and parameters.
- **Returns**: A promise that resolves with the RPC response.

## Advanced Features

### Automatic Failover

If a request to the fastest RPC fails, the `UbiquityRpcProvider` automatically tries alternative RPC endpoints for the same chain.

### Latency Checking

The `UbiquityRpcProvider` performs latency checks to determine the fastest RPC endpoint for each chain. It uses a test payload to verify the endpoint's responsiveness and correctness.

### Caching

The fastest RPC endpoints are cached to improve performance on subsequent requests. The cache is saved and loaded using environment-appropriate storage mechanisms.

### Hex Result Conversion

Small hex string results (less than 10 characters) are automatically converted to numbers for convenience. Larger hex strings (like contract bytecode) are left as-is.

## Contributing

We welcome contributions! If you have suggestions or encounter issues, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
