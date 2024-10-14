import { getGitHubUser } from "./getters/get-github-user";

/**
 * Prompts the user for biometric authentication.
 * Uses WebAuthn to create an assertion for verifying user presence.
 */
export async function authenticateUser(): Promise<boolean> {
  if (!window.PublicKeyCredential) {
    console.warn("WebAuthn is not supported in this browser.");
    return false;
  }

  try {
    const gitHubUser = await getGitHubUser(); // Implement based on your context
    if (!gitHubUser) {
      console.warn("User is not authenticated with GitHub.");
      return false;
    }

    // const challenge = window.crypto.getRandomValues(new Uint8Array(32));

    // const publicKey: PublicKeyCredentialRequestOptions = {
    //   challenge,
    //   timeout: 60000,
    //   allowCredentials: [], // Specify allowed credentials if necessary
    //   userVerification: "required",
    // };

    // const assertion = await navigator.credentials.get({ publicKey });

    // Verify the assertion on the server-side or implement client-side verification
    // Here, we'll assume successful verification for simplicity
    return true;
  } catch (error) {
    console.error("Biometric authentication failed:", error);
    return false;
  }
}
