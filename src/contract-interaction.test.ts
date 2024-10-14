import { RpcHandler } from "../src/rpc-handler";
import { ContractInteraction } from "./contract-interaction";

const rpcHandler = new RpcHandler();
const chainId = 1; // Ethereum mainnet
const tokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // DAI token
const userAddress = "0x4007CE2083c7F3E18097aeB3A39bb8eC149a341d";

async function main() {
  const contract = new ContractInteraction(rpcHandler, chainId, tokenAddress);
  const balance = await contract.callMethod("balanceOf", [userAddress]);

  if (balance) {
    console.log(`Balance: ${balance}`);
  } else {
    console.log("Failed to retrieve balance.");
  }
}

main().catch(console.error);
