// Client-side API helper

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:3000';

type ApiEnvelope<T> = {
  isSuccess?: boolean;
  message?: string;
  result?: T;
};

export type ApiError = {
  status: number;
  message: string;
  details?: any;
};

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ba_token');
}

export async function apiFetch<T>(
  path: string,
  opts: RequestInit & { auth?: boolean } = { auth: true },
): Promise<T> {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

  const headers = new Headers(opts.headers || {});
  headers.set('Accept', 'application/json');

  const isJsonBody =
    opts.body &&
    typeof opts.body === 'string' &&
    (opts.headers as any)?.['Content-Type'] === 'application/json';
  // If body is an object, caller should JSON.stringify + set header.
  if (!headers.has('Content-Type') && opts.body && !isJsonBody) {
    // leave unset
  }

  if (opts.auth !== false) {
    const token = getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...opts,
    headers,
    cache: 'no-store',
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : await res.text();

  // Backend returns a standard envelope: {isSuccess, message, result}
  const env = (data && typeof data === 'object' ? (data as ApiEnvelope<T>) : null);
  const message =
    (env && (env.message || (env as any).Message)) ||
    (data && (data.message || data.Message)) ||
    (typeof data === 'string' ? data : `Request failed (${res.status})`);

  if (!res.ok || (env && env.isSuccess === false)) {
    const err: ApiError = { status: res.status, message: String(message || 'Request failed'), details: data };
    throw err;
  }

  // If it's an envelope, return .result, otherwise return raw.
  return (env && Object.prototype.hasOwnProperty.call(env, 'result') ? (env.result as T) : (data as T));
}
