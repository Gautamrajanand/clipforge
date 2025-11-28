/**
 * API utility functions with automatic Clerk token refresh
 */

export interface FetchWithAuthOptions extends RequestInit {
  getToken: () => Promise<string | null>;
}

/**
 * Fetch with automatic Clerk token refresh
 * Always gets a fresh token before making the request
 */
export async function fetchWithAuth(
  url: string,
  options: FetchWithAuthOptions
): Promise<Response> {
  const { getToken, ...fetchOptions } = options;
  
  // Always get a fresh token (Clerk handles caching/refresh internally)
  const token = await getToken();
  
  if (!token) {
    throw new Error('No authentication token available');
  }

  return fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
}
