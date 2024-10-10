import chains from "../src/fixtures/chains.json";
import { ChainData, RpcHandler } from "../src/rpc-handler";
import { getDaiBalance } from "./get-dai-balance";

const networkIdInput = document.getElementById("network-id-input") as HTMLInputElement;
const methodNameInput = document.getElementById("method-name-input") as HTMLInputElement;
const paramsInput = document.getElementById("params-input") as HTMLInputElement;

const callRpcButton = document.getElementById("call-rpc-button");
callRpcButton.addEventListener("click", async () => {
  const networkIdSelection = parseInt(networkIdInput.value);
  const methodName = methodNameInput.value || "eth_blockNumber";
  const params = paramsInput.value ? JSON.parse(paramsInput.value) : [];
  if (!networkIdSelection) {
    console.error("Network ID is required");
    return;
  }
  await callRpc(networkIdSelection, methodName, params);
});

async function callRpc(networkId: number, method = "eth_blockNumber", params = []) {
  const rpcHandler = new RpcHandler(chains as ChainData[]);
  const response = await rpcHandler.sendRequest(networkId, { method, params });
  console.log(response); // Changed from console.trace to console.log
  const result = parseInt(response.result, 16);
  const buffer = [`eth_blockNumber: ${result}`].join("\n\n");
  document.getElementById("output").innerText = buffer;
  return rpcHandler;
}

void getDaiBalance();
