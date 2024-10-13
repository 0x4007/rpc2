import chains from "./fixtures/chains.json";
import { RpcHandler } from "./rpc-handler";
import { ChainData } from "./rpc-handler-types";
export async function useRpcHandler() {
  // const chainsUrl = `https://chainid.network/chains.json`;
  // const chains: ChainData[] = await fetch(chainsUrl).then((res) => res.json());
  const rpcHandler = new RpcHandler(chains as ChainData[]);
  const response = await rpcHandler.sendRequest(100, {
    method: "eth_blockNumber",
    params: [],
  });
  console.log(response); // Changed from console.trace to console.log
  return rpcHandler;
}

void useRpcHandler();
