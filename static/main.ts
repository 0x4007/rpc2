import { subscribeToWalletChanges } from "./connect-wallet";
import { getStablecoinBalances } from "./get-cash-balance";
import { $ } from "./call-rpc";

subscribeToWalletChanges(async (address) => {
  if (address) {
    const balances = await getStablecoinBalances(address);
    console.trace(balances);
    const buffer = [`Stablecoin balances: ${JSON.stringify(balances, null, 2)}`].join("\n\n");
    $.output.innerText = buffer;
  }
});
