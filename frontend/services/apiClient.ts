const getBackendBaseUrl = (): string => {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, "");
  }
  // Default to local FastAPI server on port 8000 if not specified
  return "http://localhost:8000";
};

export const BACKEND_URL = getBackendBaseUrl();

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (!BACKEND_URL) {
    return cleanPath;
  }
  return `${BACKEND_URL}${cleanPath}`;
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(path);
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || errorData.error || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
}
