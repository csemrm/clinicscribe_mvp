const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export type AuthPayload = {
  email: string;
  password: string;
};

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function login(payload: AuthPayload) {
  return apiRequest<{ access: string; refresh?: string; user?: unknown }>('/api/login/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function register(payload: AuthPayload & { first_name?: string; last_name?: string }) {
  return apiRequest<{ access: string; refresh?: string; user?: unknown }>('/api/register/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getMe(token: string) {
  return apiRequest('/api/me/', {
    headers: { Authorization: `Bearer ${token}` },
  });
}
