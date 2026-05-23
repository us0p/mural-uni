import { API_URL } from '@/lib/config'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = response.statusText
    try {
      const body = await response.json()
      message = body.message ?? body.detail ?? body.error ?? message
    } catch {
      // keep statusText if body isn't JSON
    }
    throw new ApiError(response.status, message)
  }
  if (response.status === 204) {
    return undefined as T
  }
  return response.json() as Promise<T>
}

const headers = { 'Content-Type': 'application/json' }

export interface ApiClient {
  get<T>(path: string): Promise<T>
  post<T>(path: string, body: unknown): Promise<T>
  put<T>(path: string, body: unknown): Promise<T>
  delete(path: string): Promise<void>
  postFormData<T>(path: string, formData: FormData, params?: Record<string, string>): Promise<T>
}

export function createApiClient(baseUrl: string): ApiClient {
  function buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(path, baseUrl)
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    }
    return url.toString()
  }

  return {
    get<T>(path: string): Promise<T> {
      return fetch(buildUrl(path), {
        method: 'GET',
        headers,
        credentials: 'include',
      }).then(handleResponse<T>)
    },

    post<T>(path: string, body: unknown): Promise<T> {
      return fetch(buildUrl(path), {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        credentials: 'include',
      }).then(handleResponse<T>)
    },

    put<T>(path: string, body: unknown): Promise<T> {
      return fetch(buildUrl(path), {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
        credentials: 'include',
      }).then(handleResponse<T>)
    },

    delete(path: string): Promise<void> {
      return fetch(buildUrl(path), {
        method: 'DELETE',
        headers,
        credentials: 'include',
      }).then(handleResponse<void>)
    },

    postFormData<T>(path: string, formData: FormData, params?: Record<string, string>): Promise<T> {
      return fetch(buildUrl(path, params), {
        method: 'POST',
        body: formData,
        credentials: 'include',
      }).then(handleResponse<T>)
    },
  }
}

export const apiClient = createApiClient(API_URL)
