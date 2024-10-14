import chains from "./fixtures/chains.json";
import { RpcHandler } from "./rpc-handler";
import { ChainData } from "./rpc-handler-types";
export async function useRpcHandler() {
  const rpcHandler = new RpcHandler(chains as ChainData[]);
  const response = await rpcHandler.sendRequest(100, {
    method: "eth_blockNumber",
    params: [],
  });
  console.trace(response);
  return rpcHandler;
}

void useRpcHandler();
