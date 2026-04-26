const apiBaseUrl = import.meta.env.VITE_API_URL ?? '/api';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

/**
 * Sends an authenticated JSON request to backend API.
 *
 * Args:
 *   path (string): Relative API path (for example "/auth/telegram").
 *   method (HttpMethod): HTTP request method.
 *   body (unknown): Optional JSON payload.
 *
 * Returns:
 *   Promise<T>: Parsed API response body.
 */
async function request<T>(path: string, method: HttpMethod, body?: unknown): Promise<T> {
  const token = localStorage.getItem('koruz_token');
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    localStorage.removeItem('koruz_token');
    localStorage.removeItem('koruz_user');
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

/**
 * POST multipart/form-data with JWT (no JSON Content-Type).
 */
async function postFormData<T>(path: string, formData: FormData): Promise<T> {
  const token = localStorage.getItem('koruz_token');
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (response.status === 401) {
    localStorage.removeItem('koruz_token');
    localStorage.removeItem('koruz_user');
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path, 'GET'),
  post: <T>(path: string, body?: unknown) => request<T>(path, 'POST', body),
  postFormData: <T>(path: string, formData: FormData) => postFormData<T>(path, formData),
  patch: <T>(path: string, body?: unknown) => request<T>(path, 'PATCH', body),
  delete: <T>(path: string) => request<T>(path, 'DELETE'),
};
