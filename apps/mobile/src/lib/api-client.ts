import type { ErrorResponse } from '@wte/shared';
import { config } from './config';

// Same contract as apps/web/src/lib/api-client.ts. Auth will add the Better Auth Expo
// client (session cookie kept in expo-secure-store) and send it with each request.
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function toApiError(response: Response, payload: unknown) {
  const error = (payload as ErrorResponse | null)?.error;
  const code = error?.code ?? 'UNKNOWN';
  const message = error?.message ?? response.statusText;
  return new ApiError(response.status, code, message, error?.details);
}

async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const hasBody = body !== undefined;
  const response = await fetch(`${config.apiUrl}/api${path}`, {
    method,
    headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
    body: hasBody ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return undefined as T;

  const payload = await readJson(response);
  if (!response.ok) throw toApiError(response, payload);

  return payload as T;
}

export const api = {
  get<T>(path: string) {
    return request<T>('GET', path);
  },
  post<T>(path: string, body?: unknown) {
    return request<T>('POST', path, body);
  },
  put<T>(path: string, body?: unknown) {
    return request<T>('PUT', path, body);
  },
  patch<T>(path: string, body?: unknown) {
    return request<T>('PATCH', path, body);
  },
  delete<T>(path: string) {
    return request<T>('DELETE', path);
  },
};
