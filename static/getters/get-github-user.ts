import { RequestError } from "@octokit/request-error";
import { Octokit } from "@octokit/rest";
import { handleRateLimit } from "../fetch-github/handle-rate-limit";
import { GitHubUser } from "../github-types";
import { getGitHubAccessToken } from "./get-github-access-token";

export async function getGitHubUser(): Promise<GitHubUser | null> {
  const accessToken = await getGitHubAccessToken();
  if (!accessToken) {
    console.warn("No GitHub access token found. User might not be authenticated.");
    return null;
  }
  return await fetchGitHubUser(accessToken);
}

async function fetchGitHubUser(accessToken: string): Promise<GitHubUser | null> {
  const octokit = new Octokit({ auth: accessToken });
  try {
    const { data } = await octokit.users.getAuthenticated();
    return data;
  } catch (error) {
    if (error instanceof RequestError) {
      if (error.status === 403) {
        await handleRateLimit(octokit, error);
      } else if (error.status === 401) {
        console.warn("Invalid credentials. You have been logged out.", error);
      } else {
        console.error("An error occurred while fetching the GitHub user:", error);
      }
    } else {
      console.error("An unexpected error occurred:", error);
    }
    return null;
  }
}
