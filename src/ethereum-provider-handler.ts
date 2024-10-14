import type { EthereumProvider } from "./ethereum-provider";

export class EthereumProviderHandler {
  private _nextPayloadId = 1;

  constructor(private _ethereumProvider: EthereumProvider) {
    if (!this._isValidProvider(_ethereumProvider)) {
      throw new Error("Invalid Ethereum provider.");
    }
  }

  private _isValidProvider(provider: unknown): provider is EthereumProvider {
    return typeof provider === "object" && provider !== null && "request" in provider && typeof (provider as EthereumProvider).request === "function";
  }

  private _getNextPayloadId(): number {
    return this._nextPayloadId++;
  }

  public async sendRequest(method: string, params = [] as unknown[]): Promise<unknown> {
    const payload = {
      jsonrpc: "2.0",
      method: method,
      params: params,
      id: this._getNextPayloadId(),
    };

    try {
      return await this._ethereumProvider.request(payload);
    } catch (error) {
      console.error(`Error during request:`, error);
      throw error;
    }
  }

  public hasEventSupport(): boolean {
    return typeof this._ethereumProvider.on === "function" && typeof this._ethereumProvider.removeListener === "function";
  }
}
