interface AbiInput {
  name: string;
  type: string;
  indexed?: boolean;
}

interface AbiOutput {
  name: string;
  type: string;
}

interface AbiItem {
  anonymous?: boolean;
  constant?: boolean;
  inputs?: AbiInput[];
  name?: string;
  outputs?: AbiOutput[];
  payable?: boolean;
  stateMutability?: string;
  type: string;
}

declare module "*.json" {
  const value: AbiItem[];
  export default value;
}
