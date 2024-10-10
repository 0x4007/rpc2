import chains from "../src/fixtures/chains.json";
import { ChainData, RpcHandler } from "../src/rpc-handler";
export async function mainModule() {
  const rpcHandler = new RpcHandler(chains as ChainData[]);
  const response = await rpcHandler.sendRequest({
    jsonrpc: "2.0",
    method: "eth_blockNumber",
    params: [],
    id: 100,
  });
  console.log(response); // Changed from console.trace to console.log
  const result = parseInt(response.result, 16);
  const buffer = [`eth_blockNumber: ${result}`].join("\n\n");
  document.getElementById("output").innerText = buffer;

  return rpcHandler;
}

void mainModule();
