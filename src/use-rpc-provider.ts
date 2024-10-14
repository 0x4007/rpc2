import { UbiquityRpcProvider } from "./rpc-provider";
export async function useRpcHandler() {
  const ubiquityRpcProvider = new UbiquityRpcProvider();
  const response = await ubiquityRpcProvider.sendRequest(100, {
    method: "eth_blockNumber",
    params: [],
  });
  console.trace(response);
  return ubiquityRpcProvider;
}

void useRpcHandler();
