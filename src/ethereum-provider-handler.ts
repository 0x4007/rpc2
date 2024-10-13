export class EthereumProviderHandler {
  private _nextPayloadId = 1;

  constructor(private ethereumProvider: any) {
    if (!ethereumProvider) {
      throw new Error("No Ethereum provider found.");
    }
  }

  private _getNextPayloadId(): number {
    return this._nextPayloadId++;
  }

  public async sendRequest(method: string, params: unknown[]): Promise<unknown> {
    const payload = {
      jsonrpc: "2.0",
      method: method,
      params: params,
      id: this._getNextPayloadId(),
    };

    try {
      return await this.ethereumProvider.request(payload);
    } catch (error) {
      console.error(`Error during request:`, error);
      throw error;
    }
  }
}
