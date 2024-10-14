import { $ } from "./call-rpc";
import { subscribeToWalletChanges } from "./connect-wallet";
import { getStablecoinBalances } from "./get-cash-balance";

subscribeToWalletChanges(async (address: string | null) => {
  if (!address) {
    // console.trace("No wallet connected");
  } else {
    const balances = await getStablecoinBalances(address);
    console.trace(balances);
    const buffer = [`Stablecoin balances: ${JSON.stringify(balances, null, 2)}`].join("\n\n");
    $.output.innerText = buffer;
  }
});

import { generateDeterministicSigningKeyWithWebAuthn } from "./deterministic-signing-key";

// const passphrase = prompt("Enter your passphrase (optional):");
const passphrase = null;
generateDeterministicSigningKeyWithWebAuthn(passphrase).then(console.trace).catch(console.error);
