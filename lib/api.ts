// frontend/lib/api.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

export interface ApiError {
  error: { code: string; message: string };
}

export class ApiRequestError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

// Note: this function is for client-side use only.
// Server components should call /auth/me directly using next/headers cookies().
async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (res.status === 401 && retry && path !== '/auth/login') {
    // Try to refresh the access token once.
    const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (refreshRes.ok) {
      // Retry original request (no further retry to avoid loops).
      return request<T>(path, options, false);
    }
    // Refresh failed — redirect to login.
    if (typeof window !== 'undefined') {
      window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}`;
    }
  }

  if (!res.ok) {
    let code = 'UNKNOWN_ERROR';
    let message = `HTTP ${res.status}`;
    try {
      const body: ApiError = await res.json();
      code = body.error?.code ?? code;
      message = body.error?.message ?? message;
    } catch {
      // non-JSON error body — fall through with default code/message
      console.warn('Failed to parse error response body');
    }
    throw new ApiRequestError(code, message, res.status);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export const api = {
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  get: <T>(path: string) =>
    request<T>(path, { method: 'GET' }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),

  del: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),

  joinWaitlist: (slug: string): Promise<void> =>
    request<void>(`/nutritionists/${slug}/waitlist`, { method: 'POST' }),

  leaveWaitlist: (slug: string): Promise<void> =>
    request<void>(`/nutritionists/${slug}/waitlist`, { method: 'DELETE' }),

  getWaitlistStatus: (slug: string): Promise<{ on_waitlist: boolean }> =>
    request<{ on_waitlist: boolean }>(`/nutritionists/${slug}/waitlist`, { method: 'GET' }),
};
