import { ec as EC } from "elliptic";
import { keccak256 } from "js-sha3";

const ec = new EC("secp256k1");

export function generateDeterministicSigningKey(passphrase?: string | null): {
  privateKey: string;
  publicKey: string;
  address: string;
} {
  const deviceFingerprint = getDeviceFingerprint();
  const combined = passphrase ? `${deviceFingerprint}|${passphrase}` : deviceFingerprint;
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
    new Date().getTimezoneOffset().toString(),
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
