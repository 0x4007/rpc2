import { RpcHandler } from "./rpc2";

export async function useRpc2() {
  const chainsUrl = `https://chainid.network/chains.json`;
  const chains = await fetch(chainsUrl).then((res) => res.json());
  const rpcHandler = new RpcHandler(chains);
  const response = await rpcHandler.sendRequest(1, { jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 });
  console.trace(response);
  return rpcHandler;
}

void useRpc2();
