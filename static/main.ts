import { $ } from "./call-rpc";
import { subscribeToWalletChanges } from "./connect-wallet";
import { getStablecoinBalances } from "./get-cash-balance";

subscribeToWalletChanges(async (address: string | null) => {
  if (address) {
    const balances = await getStablecoinBalances(address);
    console.trace(balances);
    const buffer = [`Stablecoin balances: ${JSON.stringify(balances, null, 2)}`].join("\n\n");
    $.output.innerText = buffer;
  }
});
