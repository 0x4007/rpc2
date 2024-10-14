import { RpcHandler } from "./rpc-handler";
export async function useRpcHandler() {
  const rpcHandler = new RpcHandler();
  const response = await rpcHandler.sendRequest(100, {
    method: "eth_blockNumber",
    params: [],
  });
  console.trace(response);
  return rpcHandler;
}

void useRpcHandler();
