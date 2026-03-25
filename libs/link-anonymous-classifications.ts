import { getAnonymousToken, clearAnonymousToken } from "./anonymous-token";
import apiClient from "./api";

/**
 * Links any anonymous classifications to the current authenticated user.
 * Should be called after sign-in/sign-up completes.
 * Clears the anonymous token cookie after successful linking.
 */
export async function linkAnonymousClassifications(): Promise<number> {
  const anonymousToken = getAnonymousToken();
  if (!anonymousToken) return 0;

  try {
    const response: { linked_count: number } = await apiClient.post(
      "/classification/link-anonymous",
      { anonymous_token: anonymousToken }
    );

    if (response.linked_count > 0) {
      clearAnonymousToken();
    }

    return response.linked_count;
  } catch (error) {
    console.error("Failed to link anonymous classifications:", error);
    return 0;
  }
}
