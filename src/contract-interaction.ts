import { Interface, JsonFragment } from "@ethersproject/abi";
import { RpcHandler } from "../src/rpc-handler";

export class ContractInteraction {
  private _rpcHandler: RpcHandler;
  private _chainId: number;
  private _contractAddress: string;
  private _iface: Interface;

  constructor(rpcHandler: RpcHandler, chainId: number, contractAddress: string, abi: ReadonlyArray<JsonFragment>) {
    this._rpcHandler = rpcHandler;
    this._chainId = chainId;
    this._contractAddress = contractAddress;
    this._iface = new Interface(abi);
  }

  public async callMethod(methodName: string, params: unknown[]): Promise<unknown> {
    const data = this._iface.encodeFunctionData(methodName, params);

    const payload = {
      method: "eth_call",
      params: [
        {
          to: this._contractAddress,
          data,
        },
        "latest",
      ],
    };

    try {
      const response = await this._rpcHandler.sendRequest(this._chainId, payload);
      if (response.result && response.result !== "0x") {
        return this._iface.decodeFunctionResult(methodName, response.result as string);
      }
      return null;
    } catch (error) {
      console.error(`Error calling method ${methodName}:`, error);
      return null;
    }
  }
}
