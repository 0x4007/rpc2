import chains from "../src/fixtures/chains.json";
import { ChainData, RpcHandler } from "../src/rpc-handler";

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

async function callRpc(networkId: number, method = "eth_blockNumber", params = []) {
  const rpcHandler = new RpcHandler(chains as ChainData[]);
  const response = await rpcHandler.sendRequest(networkId, { jsonrpc: "2.0", method, params });
  console.log(response); // Changed from console.trace to console.log
  const result = parseInt(response.result, 16);
  const buffer = [`eth_blockNumber: ${result}`].join("\n\n");
  document.getElementById("output").innerText = buffer;
  return rpcHandler;
}
