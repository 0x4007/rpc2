import chains from "./fixtures/chains.json";
import { RpcHandler, ChainData } from "./rpc-handler";
export async function useRpc2() {
  // const chainsUrl = `https://chainid.network/chains.json`;
  // const chains: ChainData[] = await fetch(chainsUrl).then((res) => res.json());
  const rpcHandler = new RpcHandler(chains as ChainData[]);
  const response = await rpcHandler.sendRequest({
    jsonrpc: "2.0",
    method: "eth_blockNumber",
    params: [],
    id: 100,
  });
  console.log(response); // Changed from console.trace to console.log
  return rpcHandler;
}

void useRpc2();
