import chains from "../src/fixtures/chains.json";
import { ChainData, RpcHandler } from "../src/rpc-handler";
import { getStablecoinBalances } from "./get-cash-balance";

const networkIdInput = document.getElementById("network-id-input") as HTMLInputElement;
const methodNameInput = document.getElementById("method-name-input") as HTMLInputElement;
const paramsInput = document.getElementById("params-input") as HTMLInputElement;
const callRpcButton = document.getElementById("call-rpc-button") as HTMLButtonElement;
const output = document.getElementById("output") as HTMLPreElement;

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
  console.trace(response);
  // const result = parseInt(response.result, 16);
  // const buffer = [`eth_blockNumber: ${result}`].join("\n\n");
  output.innerText = response;
  return rpcHandler;
}

void getStablecoinBalances("0x4007CE2083c7F3E18097aeB3A39bb8eC149a341d")
  .then((balances) => {
    console.log(balances);
    const buffer = [`Stablecoin balances: ${JSON.stringify(balances, null, 2)}`].join("\n\n");
    output.innerText = buffer;
  })
  .catch(console.error);
