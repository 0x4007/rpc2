import chains from "../src/fixtures/chains.json";
import { RpcHandler } from "../src/rpc-handler";
import { ChainData } from "../src/rpc-handler-types";

const rpcHandler = new RpcHandler(chains as ChainData[]);
const chainId = 1; // Ethereum mainnet

interface StablecoinInfo {
  name: string;
  address: string;
  decimals: number;
}

const stablecoins: StablecoinInfo[] = [
  { name: "DAI", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18 },
  { name: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
  { name: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
  { name: "LUSD", address: "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0", decimals: 18 },
  { name: "UUSD", address: "0xb6919Ef2ee4aFC163BC954C5678e2BB570c2D103", decimals: 18 },
];

async function getTokenBalance(tokenAddress: string, userAddress: string): Promise<bigint> {
  const methodId = "0x70a08231";
  const paddedAddress = userAddress.replace(/^0x/, "").toLowerCase().padStart(64, "0");
  const data = methodId + paddedAddress;

  const payload = {
    method: "eth_call",
    params: [
      {
        to: tokenAddress,
        data,
      },
      "latest",
    ],
  };

  try {
    const response = await rpcHandler.sendRequest(chainId, payload);
    if (response.result && response.result !== "0x") {
      return BigInt(response.result);
    }
    return BigInt(0);
  } catch (error) {
    console.error(`Error fetching balance for token ${tokenAddress}:`, error);
    return BigInt(0);
  }
}

export async function getStablecoinBalances(userAddress: string) {
  const balances: { [key: string]: number } = {};

  for (const coin of stablecoins) {
    const balance = await getTokenBalance(coin.address, userAddress);
    const balanceNumber = Number(balance) / 10 ** coin.decimals;
    const formattedBalance = balanceNumber % 1 === 0 ? balanceNumber.toFixed(0) : balanceNumber.toString();
    balances[coin.name] = parseFloat(formattedBalance);
  }

  console.log("Stablecoin balances:", balances);
  return balances;
}
