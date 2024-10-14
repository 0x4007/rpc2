import { ec as EC } from "elliptic";
import { keccak256 } from "js-sha3";

// Initialize elliptic curve
const ec = new EC("secp256k1");

/**
 * Generates a new key pair and stores the private key securely.
 */
export async function generateAndStoreKeyPair(): Promise<void> {
  const keyPair = ec.genKeyPair();
  const privateKeyHex = keyPair.getPrivate("hex");
  const publicKeyHex = keyPair.getPublic("hex");
  const address = publicKeyToAddress(publicKeyHex);

  // Encrypt the private key before storing
  const encryptedPrivateKey = await encryptPrivateKey(privateKeyHex);

  // Store the encrypted private key in IndexedDB
  await storeInIndexedDb("privateKey", encryptedPrivateKey);

  // Optionally, store the public key and address if needed
  await storeInIndexedDb("publicKey", publicKeyHex);
  await storeInIndexedDb("address", address);
}

/**
 * Converts a public key to an Ethereum address.
 */
function publicKeyToAddress(publicKey: string): string {
  const pubKeyBytes = hexToUint8Array(publicKey.slice(2)); // Remove '0x' prefix if present
  const hash = keccak256(pubKeyBytes);
  return "0x" + hash.slice(-40);
}

/**
 * Converts a hex string to a Uint8Array.
 */
function hexToUint8Array(hexString: string): Uint8Array {
  const matches = hexString.match(/.{1,2}/g);
  if (!matches) {
    throw new Error(`Invalid hex string: ${hexString}`);
  }
  return new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
}

/**
 * Encrypts the private key using Web Crypto API.
 * The encryption key is derived from user credentials (e.g., passphrase).
 */
async function encryptPrivateKey(privateKey: string): Promise<ArrayBuffer> {
  const passphrase = await promptUserForPassphrase(); // Implement this based on your UI
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey("raw", encoder.encode(passphrase), { name: "PBKDF2" }, false, ["deriveKey"]);
  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("unique-salt"), // Use a unique salt
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encoder.encode(privateKey)
  );

  // Combine IV and encrypted data for storage
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  return combined.buffer;
}

/**
 * Stores data in IndexedDB.
 */
async function storeInIndexedDb(key: string, data: string | ArrayBuffer): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("SecureKeyDB", 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore("keys");
    };

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("keys", "readwrite");
      const store = transaction.objectStore("keys");
      store.put(data, key);
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Prompts the user for a passphrase.
 * Implement this function based on your application's UI/UX requirements.
 */
async function promptUserForPassphrase(): Promise<string> {
  // Example implementation using prompt (replace with modal or secure input as needed)
  return prompt("Enter a passphrase to secure your signing key:") || "";
}

/**
 * Retrieves and decrypts the stored private key.
 */
export async function retrievePrivateKey(): Promise<string | null> {
  const encryptedPrivateKey = (await getFromIndexedDb("privateKey")) as ArrayBuffer;
  if (!encryptedPrivateKey) {
    console.warn("No private key found. Please generate one first.");
    return null;
  }

  return await decryptPrivateKey(encryptedPrivateKey);
}

/**
 * Decrypts the private key using Web Crypto API.
 */
async function decryptPrivateKey(encryptedData: ArrayBuffer): Promise<string> {
  const passphrase = await promptUserForPassphrase(); // Implement this securely
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey("raw", encoder.encode(passphrase), { name: "PBKDF2" }, false, ["deriveKey"]);
  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("unique-salt"), // Same salt used during encryption
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  const combined = new Uint8Array(encryptedData);
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    data
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Retrieves data from IndexedDB.
 */
async function getFromIndexedDb(key: string): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("SecureKeyDB", 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore("keys");
    };

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("keys", "readonly");
      const store = transaction.objectStore("keys");
      const getRequest = store.get(key);
      getRequest.onsuccess = () => {
        db.close();
        resolve(getRequest.result);
      };
      getRequest.onerror = () => {
        db.close();
        reject(getRequest.error);
      };
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Generates the signing key pair if not already generated.
 */
export async function getOrGenerateKeyPair(): Promise<{
  privateKey: string;
  publicKey: string;
  address: string;
}> {
  let privateKey = await retrievePrivateKey();
  if (!privateKey) {
    await generateAndStoreKeyPair();
    privateKey = await retrievePrivateKey();
    if (!privateKey) {
      throw new Error("Failed to generate and store the private key.");
    }
  }

  const keyPair = ec.keyFromPrivate(privateKey);
  const publicKey = keyPair.getPublic("hex");
  const address = publicKeyToAddress(publicKey);

  return {
    privateKey: "0x" + privateKey,
    publicKey: "0x" + publicKey,
    address: "0x" + address,
  };
}
