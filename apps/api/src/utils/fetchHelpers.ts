export interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

export class FetchError extends Error {
  constructor(
    message: string,
    public status: number,
    public url: string,
    public response?: Response
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    retries = 3,
    retryDelay = 1000,
    timeout = 10000,
    ...fetchOptions
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new FetchError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          url,
          response
        );
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === retries) {
        break;
      }

      // Don't retry on 4xx errors (client errors)
      if (error instanceof FetchError && error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
    }
  }

  throw lastError!;
}

export async function fetchJson<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const response = await fetchWithRetry(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  return response.json() as Promise<T>;
}

export function createRateLimiter(maxRequests: number, timeWindow: number) {
  const requests: number[] = [];

  return function checkRateLimit(): boolean {
    const now = Date.now();
    const windowStart = now - timeWindow;

    // Remove old requests outside the window
    while (requests.length > 0 && requests[0] < windowStart) {
      requests.shift();
    }

    if (requests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }

    requests.push(now);
    return true; // Request allowed
  };
}

// ESPN API rate limiter: 1 request per minute per league
export const espnRateLimiter = createRateLimiter(1, 60000);

// FantasyPros rate limiter: 10 requests per minute
export const fantasyProsRateLimiter = createRateLimiter(10, 60000);

// NOAA rate limiter: 5 requests per minute
export const noaaRateLimiter = createRateLimiter(5, 60000); 