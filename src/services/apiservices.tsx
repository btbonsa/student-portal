const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.error("NEXT_PUBLIC_API_URL is not set. Please configure this environment variable.");
}

async function apiRequest <T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  // Use server-side proxy to avoid mixed content issues with HTTP APIs
  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  // Only set Content-Type for non-FormData requests
  // FormData automatically sets the correct Content-Type with boundary
  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  if (token) {
    (headers as Record<string, string>).Authorization =
      `Bearer ${token}`;
  }

  const response = await fetch(`/api/proxy?path=${encodeURIComponent(endpoint)}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || data.message || `API request failed with status ${response.status}`
    );
  }

  return data;
};

export default apiRequest;
