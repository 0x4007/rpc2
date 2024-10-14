// connect-wallet.ts

import { EthereumProviderHandler } from "../src/ethereum-provider-handler";

document.getElementById("connect-wallet-button")?.addEventListener("click", async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const ethereumProviderHandler = new EthereumProviderHandler(window.ethereum);

      // Get the list of accounts
      const accounts = (await ethereumProviderHandler.sendRequest("eth_accounts", [])) as string[];
      const selectedAccount = accounts[0];

      console.log("Connected account:", selectedAccount);
      // You can now use the selectedAccount variable as needed
    } catch (error) {
      console.error("Error connecting to wallet:", error);
    }
  } else {
    console.error("No Ethereum provider found. Please install a wallet like MetaMask.");
  }
});
