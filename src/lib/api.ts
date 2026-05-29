interface ApiCallOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: Record<string, any>;
  bearerToken?: string;
  basicAuth?: {
    username: string;
    password?: string;
  };
}

export async function callExternalApi<T = any>(
  url: string,
  options: ApiCallOptions = {}
): Promise<T> {
  const method = options.method || 'GET';
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (!headers.has('Authorization')) {
    if (options.bearerToken) {
      headers.set('Authorization', `Bearer ${options.bearerToken}`);
    } else if (options.basicAuth) {
      const authString = Buffer.from(`${options.basicAuth.username}:${options.basicAuth.password || ''}`).toString('base64');
      headers.set('Authorization', `Basic ${authString}`);
    }
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (options.body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    throw new Error(`API Error [${method}] ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getRoomsFromApi(search: string): Promise<any> {
  const url = `https://api.epfl.ch/v1/rooms?query=${encodeURIComponent(search)}`;

  return callExternalApi(url, {
    basicAuth: {
      username: process.env.API_USER || '',
      password: process.env.API_PASSWORD || ''
    }
  });
}
