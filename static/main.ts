import { RpcHandler } from "../src/rpc-handler";
import { getStablecoinBalances } from "./get-cash-balance";

// Execute the code in connect-wallet.ts
import "./connect-wallet";
import { subscribeToWalletChanges } from "./connect-wallet";

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
  const rpcHandler = new RpcHandler();
  const response = await rpcHandler.sendRequest(networkId, { method, params });
  console.trace(response);
  output.innerText = response.result;
  return rpcHandler;
}

subscribeToWalletChanges(async (address) => {
  if (address) {
    const balances = await getStablecoinBalances(address);
    console.trace(balances);
    const buffer = [`Stablecoin balances: ${JSON.stringify(balances, null, 2)}`].join("\n\n");
    output.innerText = buffer;
  }
});
