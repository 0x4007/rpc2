import { UbiquityRpcProvider } from "../src/rpc-provider";
export const $ = {
  networkIdInput: document.getElementById("network-id-input") as HTMLInputElement,
  methodNameInput: document.getElementById("method-name-input") as HTMLInputElement,
  paramsInput: document.getElementById("params-input") as HTMLInputElement,
  callRpcButton: document.getElementById("call-rpc-button") as HTMLButtonElement,
  output: document.getElementById("output") as HTMLPreElement,
};

$.callRpcButton.addEventListener("click", async () => {
  const networkIdSelection = parseInt($.networkIdInput.value);
  const methodName = $.methodNameInput.value || "eth_blockNumber";
  const params = $.paramsInput.value ? JSON.parse($.paramsInput.value) : [];
  if (!networkIdSelection) {
    console.error("Network ID is required");
    return;
  }
  await callRpc(networkIdSelection, methodName, params);
});

async function callRpc(networkId: number, method = "eth_blockNumber", params = []) {
  const ubiquityRpcProvider = new UbiquityRpcProvider();
  const response = await ubiquityRpcProvider.sendRequest(networkId, { method, params });
  console.trace(response);
  $.output.innerText = response.result as string;
  return ubiquityRpcProvider;
}
