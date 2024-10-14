import { ec as EC } from "elliptic";
import { keccak256 } from "js-sha3";
import { getGitHubUser } from "./getters/get-github-user";
import { displayPopupMessage } from "./rendering/display-popup-modal";

const ec = new EC("secp256k1");

export async function generateDeterministicSigningKeyWithWebAuthn(passphrase?: string | null): Promise<{
  privateKey: string;
  publicKey: string;
  address: string;
}> {
  displayPopupMessage({
    modalHeader: "WebAuthn Signer",
    modalBody: "You will be prompted to unlock your wallet. Please use your device's authentication method.",
    isError: false,
    // url : null
  });

  const credentialId = await getCredentialId();
  const deviceEntropy = credentialId ? bufferToHex(credentialId) : getDeviceFingerprint();
  const combined = passphrase ? `${deviceEntropy}|${passphrase}` : deviceEntropy;
  const privateKeyHex = hashToPrivateKey(combined);
  const keyPair = ec.keyFromPrivate(privateKeyHex);

  const publicKey = keyPair.getPublic("hex");
  const address = publicKeyToAddress(publicKey);

  return {
    privateKey: "0x" + privateKeyHex,
    publicKey: "0x" + publicKey,
    address: "0x" + address,
  };
}

async function getCredentialId(): Promise<ArrayBuffer | null> {
  if (!window.PublicKeyCredential) {
    console.warn("WebAuthn is not supported in this browser.");
    return null;
  }

  try {
    const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    if (!isAvailable) {
      console.warn("No suitable authenticator is available.");
      return null;
    }

    const gitHubUser = await getGitHubUser();
    if (!gitHubUser) {
      console.warn("User is not authenticated with GitHub.");
      return null;
    }

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge: new Uint8Array(32),
      rp: {
        name: "UbiquityOS WebAuthn Signer",
        id: window.location.hostname,
      },
      user: {
        id: new TextEncoder().encode(gitHubUser.id.toString()),
        name: gitHubUser.login,
        displayName: gitHubUser.name || gitHubUser.login,
      },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
      },
      timeout: 60000,
      attestation: "none",
    };

    // Generate a random challenge
    window.crypto.getRandomValues(publicKeyCredentialCreationOptions.challenge as Uint8Array);

    const credential = await navigator.credentials.create({ publicKey: publicKeyCredentialCreationOptions });
    if (credential instanceof PublicKeyCredential) {
      return credential.rawId;
    }
  } catch (error) {
    console.error("Error creating credential:", error);
  }
  return null;
}

// Helper functions remain the same
function getDeviceFingerprint(): string {
  const fingerprintComponents = [
    navigator.userAgent,
    navigator.platform,
    navigator.language,
    screen.colorDepth.toString(),
    screen.width.toString(),
    screen.height.toString(),
    screen.availWidth.toString(),
    screen.availHeight.toString(),
    // Remove timezone offset
    navigator.hardwareConcurrency.toString(),
    navigator.deviceMemory ? navigator.deviceMemory.toString() : "unknown",
    // Add more stable identifiers if available
  ];

  return fingerprintComponents.join("|");
}

function hashToPrivateKey(input: string): string {
  // Hash the input using Keccak256
  const hash = keccak256(input);
  // Ensure the private key is 32 bytes (64 hex characters)
  return hash.slice(0, 64);
}

function publicKeyToAddress(publicKey: string): string {
  // Remove the '04' prefix that indicates an uncompressed public key
  const pubKeyWithoutPrefix = publicKey.slice(2);
  // Convert hex string to Uint8Array
  const pubKeyBytes = hexToUint8Array(pubKeyWithoutPrefix);
  // Hash the public key with Keccak256
  const hash = keccak256(pubKeyBytes);
  // Take the last 20 bytes (40 hex characters) as the address
  return hash.slice(-40);
}

// Helper function to convert hex string to Uint8Array
function hexToUint8Array(hexString: string): Uint8Array {
  const matches = hexString.match(/.{1,2}/g);
  if (!matches) {
    throw new Error(`Invalid hex string: ${hexString}`);
  }
  return new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
}

function bufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
