import chains from "../src/fixtures/chains.json";
import { ChainData, RpcHandler } from "../src/rpc-handler";

export async function callRpc(id: number, method = "eth_blockNumber", params = []) {
  const rpcHandler = new RpcHandler(chains as ChainData[]);
  const response = await rpcHandler.sendRequest({ jsonrpc: "2.0", method, params, id });
  console.log(response); // Changed from console.trace to console.log
  const result = parseInt(response.result, 16);
  const buffer = [`eth_blockNumber: ${result}`].join("\n\n");
  document.getElementById("output").innerText = buffer;
  return rpcHandler;
}

const networkIdInput = document.getElementById("network-id-input") as HTMLInputElement;

const callRpcButton = document.getElementById("call-rpc-button");
callRpcButton.addEventListener("click", async () => {
  const networkIdSelection = parseInt(networkIdInput.value);
  if (!networkIdSelection) {
    console.error("Network ID is required");
    return;
  }
  await callRpc(networkIdSelection);
});
