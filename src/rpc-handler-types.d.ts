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

export interface Feature {
  name: string;
}

export interface Currency {
  name: string;
  symbol: string;
  decimals: number;
}

export interface Explorer {
  name: string;
  url: string;
  standard: string;
  icon?: string;
}

export interface ParentChain {
  type: string;
  chain: string;
  bridges: { url: string }[];
}

export interface StorageInterface {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: number | string | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}
