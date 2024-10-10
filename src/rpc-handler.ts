export interface ChainData {
  name: string;
  chain: string;
  icon?: string;
  rpc: string[];
  features?: Feature[];
  faucets?: string[];
  nativeCurrency?: Currency;
  infoURL?: string;
  shortName?: string;
  chainId: number;
  networkId?: number;
  slip44?: number;
  ens?: { registry: string };
  explorers?: Explorer[];
  title?: string;
  status?: string;
  redFlags?: string[];
  parent?: ParentChain;
}

interface Feature {
  name: string;
}

interface Currency {
  name: string;
  symbol: string;
  decimals: number;
}

interface Explorer {
  name: string;
  url: string;
  standard: string;
  icon?: string;
}

interface ParentChain {
  type: string;
  chain: string;
  bridges: { url: string }[];
}

interface StorageInterface {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

// Browser storage implementation
class BrowserStorage implements StorageInterface {
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }
  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }
}

// Node.js storage implementation (in-memory)
class NodeStorage implements StorageInterface {
  private _store: { [key: string]: string } = {};
  getItem(key: string): string | null {
    return this._store[key] || null;
  }
  setItem(key: string, value: string): void {
    this._store[key] = value;
  }
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.document !== "undefined";
}

export class RpcHandler {
  private _chainData: ChainData[];
  private _storage: StorageInterface;
  private _fastestRpcs: { [chainId: number]: string } = {};
  private _nextPayloadId: number = 1;

  constructor(chainData: ChainData[]) {
    this._chainData = chainData;
    this._storage = isBrowser() ? new BrowserStorage() : new NodeStorage();
    this._loadCache();
  }

  private _loadCache(): void {
    const cache = this._storage.getItem("fastestRpcs");
    if (cache) {
      this._fastestRpcs = JSON.parse(cache);
    }
  }

  private _saveCache(): void {
    this._storage.setItem("fastestRpcs", JSON.stringify(this._fastestRpcs));
  }
  private async _checkLatency(rpc: string): Promise<{ rpc: string; latency: number }> {
    const start = Date.now();

    // Prepare a test eth_call to check UBQ token balance
    const methodId = "0x70a08231"; // `balanceOf(address)` method ID
    const address = "0xefC0e701A824943b469a694aC564Aa1efF7Ab7dd"; // Your address
    const addressWithoutPrefix = address.replace(/^0x/, "");
    const paddedAddress = addressWithoutPrefix.padStart(64, "0");
    const data = methodId + paddedAddress;

    const testPayload = {
      jsonrpc: "2.0",
      method: "eth_call",
      params: [
        {
          to: "0x4e38d89362f7e5db0096ce44ebd021c3962aa9a0", // UBQ token address
          data: data,
        },
        "latest",
      ],
      id: this._getNextPayloadId(),
    };

    try {
      const response = await this._sendRpcRequest(rpc, testPayload, 10000);
      if (response && response.result !== undefined) {
        const balance = BigInt(response.result);
        if (balance > 0n) {
          const latency = Date.now() - start;
          return { rpc, latency };
        }
      }
      return { rpc, latency: -1 };
    } catch {
      return { rpc, latency: -1 };
    }
  }

  private async _findFastestRpc(rpcs: string[]): Promise<string> {
    const latencyPromises = rpcs.map((rpc) => this._checkLatency(rpc));
    const results = await Promise.all(latencyPromises);

    const validResults = results.filter((res) => res.latency >= 0);

    if (validResults.length === 0) {
      throw new Error("No valid RPC endpoints found.");
    }

    validResults.sort((a, b) => a.latency - b.latency);

    return validResults[0].rpc;
  }

  private async _sendRpcRequest(rpc: string, payload: Record<string, unknown>, timeout: number): Promise<Record<string, unknown>> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const fetchOptions: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      };

      const response = await fetch(rpc, fetchOptions);
      clearTimeout(id);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        console.error("RPC Error:", data.error);
      }
      return data;
    } catch (error) {
      clearTimeout(id);
      console.error(`Error during RPC request to ${rpc}:`, error);
      throw error;
    }
  }

  private async _getFastestRpc(chainId: number): Promise<string> {
    if (this._fastestRpcs[chainId]) {
      return this._fastestRpcs[chainId];
    }

    const chain = this._chainData.find((c) => c.chainId === chainId);
    if (!chain || !chain.rpc || chain.rpc.length === 0) {
      // If no RPC found, search again in the entire chainData
      const allRpcs = this._chainData.flatMap((c) => c.rpc);
      if (allRpcs.length === 0) {
        throw new Error(`No RPC endpoints found for any chain`);
      }
      const fastestRpc = await this._findFastestRpc(allRpcs);
      this._fastestRpcs[chainId] = fastestRpc;
      this._saveCache();
      return fastestRpc;
    }

    const fastestRpc = await this._findFastestRpc(chain.rpc);
    this._fastestRpcs[chainId] = fastestRpc;
    this._saveCache();

    return fastestRpc;
  }

  public async sendRequest(chainId: number, payload: { method: string; params: unknown[] }): Promise<Record<string, unknown>> {
    if (!chainId) {
      throw new Error("Invalid chainId");
    }

    const rpc = await this._getFastestRpc(chainId);

    // Log the selected RPC endpoint
    console.log(`Using RPC endpoint: ${rpc}`);

    const fullPayload = { ...payload, id: this._getNextPayloadId(), jsonrpc: "2.0" };
    try {
      return await this._sendRpcRequest(rpc, fullPayload, 10000);
    } catch {
      return await this._handleFailedRequest(chainId, rpc, fullPayload);
    }
  }

  private async _handleFailedRequest(chainId: number, failedRpc: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    this._removeFailedRpcFromCache(chainId);
    const rpcs = this._getRpcsForChain(chainId);
    return await this._tryAlternativeRpcs(rpcs, failedRpc, chainId, payload);
  }

  private _removeFailedRpcFromCache(chainId: number): void {
    delete this._fastestRpcs[chainId];
    this._saveCache();
  }

  private _getRpcsForChain(chainId: number): string[] {
    const chain = this._chainData.find((c) => c.chainId === chainId);
    const allRpcs = chain?.rpc?.length ? chain.rpc : this._chainData.flatMap((c) => c.rpc);

    // Filter out WebSocket URLs
    return allRpcs.filter((rpc) => !rpc.startsWith("ws://") && !rpc.startsWith("wss://"));
  }

  private async _tryAlternativeRpcs(rpcs: string[], failedRpc: string, chainId: number, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (rpcs.length === 0) {
      throw new Error(`No RPC endpoints found for any chain`);
    }

    for (const alternativeRpc of rpcs) {
      if (alternativeRpc === failedRpc) continue;
      try {
        const response = await this._sendRpcRequest(alternativeRpc, payload, 10000);
        this._updateFastestRpc(chainId, alternativeRpc);
        return response;
      } catch {
        continue;
      }
    }
    throw new Error("All RPC endpoints failed.");
  }

  private _updateFastestRpc(chainId: number, rpc: string): void {
    this._fastestRpcs[chainId] = rpc;
    this._saveCache();
  }

  private _getNextPayloadId(): number {
    return this._nextPayloadId++;
  }
}
