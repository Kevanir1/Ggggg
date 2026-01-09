const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';

const defaultTimeout = 15000;

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

async function request(path: string, method: HttpMethod = 'GET', body?: any, timeout = defaultTimeout) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal: controller.signal,
  }).finally(() => clearTimeout(id));

  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }

  if (!res.ok) {
    const message = (data && data.message) || res.statusText || 'Network error';
    throw new Error(message);
  }

  return data;
}

export const api = {
  get: (path: string) => request(path, 'GET'),
  post: (path: string, body?: any) => request(path, 'POST', body),
  patch: (path: string, body?: any) => request(path, 'PATCH', body),
  del: (path: string) => request(path, 'DELETE'),
  put: (path: string, body?: any) => request(path, 'PUT', body),
  setAuthToken,
  API_BASE,
};

export default api;
