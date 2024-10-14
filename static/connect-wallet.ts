import { UbiquityEthereumProvider } from "../src/ethereum-provider-handler";

let walletAddress: string | null = null;

const DATA_CONNECTED_WALLET = "data-connected-wallet";
const connectWalletButton = document.getElementById("connect-wallet-button") as HTMLButtonElement;
connectWalletButton?.addEventListener("click", toggleWalletConnection);

// Add this line to check for existing connection when the page loads
document.addEventListener("DOMContentLoaded", checkExistingConnection);

async function toggleWalletConnection() {
  if (connectWalletButton.hasAttribute(DATA_CONNECTED_WALLET)) {
    await disconnectWallet();
  } else {
    await connectWallet();
  }
}

async function connectWallet() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      await updateConnectionStatus();
    } catch (error) {
      console.error("Error connecting to wallet:", error);
    }
  } else {
    console.error("No Ethereum provider found. Please install a wallet like MetaMask.");
  }
}

async function disconnectWallet() {
  setWalletAddress(null);
  connectWalletButton.removeAttribute(DATA_CONNECTED_WALLET);
  console.log("Wallet disconnected");
}

async function checkExistingConnection() {
  if (typeof window.ethereum !== "undefined") {
    const ethereumProviderHandler = new UbiquityEthereumProvider(window.ethereum);
    const accounts = (await ethereumProviderHandler.sendRequest("eth_accounts")) as string[];

    if (accounts.length > 0) {
      await updateConnectionStatus();
    }
  }
}

async function updateConnectionStatus() {
  if (!window.ethereum) {
    return;
  }

  const ethereumProviderHandler = new UbiquityEthereumProvider(window.ethereum);
  const accounts = (await ethereumProviderHandler.sendRequest("eth_accounts")) as string[];
  const selectedAccount = accounts[0];

  setWalletAddress(selectedAccount);
  console.log("Connected account:", selectedAccount);
  connectWalletButton.setAttribute(DATA_CONNECTED_WALLET, selectedAccount);
}

// Listen for account changes
if (window.ethereum) {
  window.ethereum.on("accountsChanged", async (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      await disconnectWallet();
    } else {
      // User switched accounts
      await updateConnectionStatus();
    }
  });
}

const walletEventEmitter = new EventTarget();

// Setter for wallet address
export function setWalletAddress(address: string | null): void {
  walletAddress = address;
  walletEventEmitter.dispatchEvent(new CustomEvent("walletAddressChanged", { detail: address }));
}

// Getter for wallet address
export function getWalletAddress(): string | null {
  return walletAddress;
}

// Subscribe to wallet address changes
export function subscribeToWalletChanges(callback: (address: string | null) => void): void {
  walletEventEmitter.addEventListener("walletAddressChanged", ((event: CustomEvent) => {
    callback(event.detail);
  }) as EventListener);
}

// Unsubscribe from wallet address changes
export function unsubscribeFromWalletChanges(callback: (address: string | null) => void): void {
  walletEventEmitter.removeEventListener("walletAddressChanged", callback as EventListener);
}
