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
  });

  const credentialId = await getCredentialId();
  if (!credentialId) {
    throw new Error("Failed to get credential ID from WebAuthn");
  }

  const deviceEntropy = bufferToHex(credentialId);
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

    // Use a fixed challenge based on the GitHub user ID
    const challenge = new TextEncoder().encode(`UbiquityOS-${gitHubUser.id}`);

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
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

    const credential = await navigator.credentials.create({ publicKey: publicKeyCredentialCreationOptions });
    if (credential instanceof PublicKeyCredential) {
      return credential.rawId;
    }
  } catch (error) {
    console.error("Error creating credential:", error);
  }
  return null;
}

function hashToPrivateKey(input: string): string {
  const hash = keccak256(input);
  return hash.slice(0, 64);
}

function publicKeyToAddress(publicKey: string): string {
  const pubKeyWithoutPrefix = publicKey.slice(2);
  const pubKeyBytes = hexToUint8Array(pubKeyWithoutPrefix);
  const hash = keccak256(pubKeyBytes);
  return hash.slice(-40);
}

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
