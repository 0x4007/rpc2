/* eslint-disable @typescript-eslint/no-explicit-any */
interface RequestArguments {
  method: string;
  params?: unknown[] | object;
}

export interface EthereumProvider {
  request: (args: RequestArguments) => Promise<unknown>;
  on?: (eventName: string, callback: (...args: any[]) => void) => void;
  removeListener?: (eventName: string, callback: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}
