const defaultBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface ApiRequestOptions {
  url: string
  method: HttpMethod
  data?: Record<string, unknown>
  headers?: Record<string, string>
  baseUrl?: string
  credentials?: RequestCredentials
}

export class ApiService {
  private static defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  static async request<T>(options: ApiRequestOptions): Promise<T> {
    const {
      url,
      method,
      data,
      headers = {},
      baseUrl = defaultBaseUrl,
      credentials = 'include',
    } = options

    try {
      const response = await fetch(`${baseUrl}${url}`, {
        method,
        headers: {
          ...this.defaultHeaders,
          ...headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        credentials,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Ошибка ${response.status}: ${errorText || 'Неизвестная ошибка'}`,
        )
      }

      // Если метод DELETE или нет тела, возвращаем пустой объект
      if (method === 'DELETE' || response.status === 204) {
        return {} as T
      }

      return await response.json()
    } catch (error) {
      console.error(`API Error (${method} ${url}):`, error)
      throw error instanceof Error
        ? error
        : new Error('Неизвестная ошибка при запросе к API')
    }
  }

  static get<T>(
    url: string,
    options: Omit<ApiRequestOptions, 'url' | 'method'> = {},
  ) {
    return this.request<T>({ url, method: 'GET', ...options })
  }

  static post<T>(
    url: string,
    data: Record<string, unknown>,
    options: Omit<ApiRequestOptions, 'url' | 'method' | 'data'> = {},
  ) {
    return this.request<T>({ url, method: 'POST', data, ...options })
  }

  static put<T>(
    url: string,
    data: Record<string, unknown>,
    options: Omit<ApiRequestOptions, 'url' | 'method' | 'data'> = {},
  ) {
    return this.request<T>({ url, method: 'PUT', data, ...options })
  }

  static delete<T>(
    url: string,
    options: Omit<ApiRequestOptions, 'url' | 'method'> = {},
  ) {
    return this.request<T>({ url, method: 'DELETE', ...options })
  }

  static patch<T>(
    url: string,
    data: Record<string, unknown>,
    options: Omit<ApiRequestOptions, 'url' | 'method' | 'data'> = {},
  ) {
    return this.request<T>({ url, method: 'PATCH', data, ...options })
  }
}
