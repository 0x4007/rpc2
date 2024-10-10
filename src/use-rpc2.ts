import { RpcHandler } from "./rpc2";

export async function useRpc2() {
  const chainsUrl = `https://chainid.network/chains.json`;
  const chains = await fetch(chainsUrl).then((res) => res.json());
  const rpcHandler = new RpcHandler(chains);
  console.trace(rpcHandler);
  return rpcHandler;
}
