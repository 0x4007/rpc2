import chains from "../src/fixtures/chains.json";
import { ChainData, RpcHandler } from "../src/rpc-handler";

const rpcHandler = new RpcHandler(chains as ChainData[]); // Assuming you have chainData
const chainId = 1; // Ethereum mainnet

export async function getDaiBalance() {
  try {
    const methodId = "0x70a08231";
    const address = "4007CE2083c7F3E18097aeB3A39bb8eC149a341d".replace(/^0x/, "").toLowerCase();
    const paddedAddress = address.padStart(64, "0");
    const data = methodId + paddedAddress;

    const payload = {
      method: "eth_call",
      params: [
        {
          to: "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI contract address
          data,
        },
        "latest", // Use the latest block
      ],
    };

    console.log("Sending request with payload:", JSON.stringify(payload, null, 2));
    console.log("Chain ID:", chainId);

    const response = await rpcHandler.sendRequest(chainId, payload);
    console.log("Full RPC response:", JSON.stringify(response, null, 2));

    if (response.result) {
      if (response.result === "0x") {
        console.error("The result is '0x', which indicates an error in the RPC call.");
      } else {
        // The result is a hex string representing the balance in wei
        const balance = BigInt(response.result);
        console.log(`DAI balance in wei: ${balance}`);
        const balanceInDai = Number(balance) / 1e18;
        console.log(`DAI balance in DAI: ${balanceInDai}`);
      }
    } else {
      console.error("Unexpected response structure:", response);
    }
  } catch (error) {
    console.error("Error fetching DAI balance:", error);
  }
}

// Add event listener for the 'keydown' event
document.addEventListener("keydown", (event) => {
  // Check if the pressed key is the Enter key
  if (event.key === "Enter") {
    void getDaiBalance();
  }
});
