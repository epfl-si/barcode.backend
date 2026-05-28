interface ApiCallOptions extends Omit<RequestInit, 'body'> {
  body?: any;
  basicAuth?: {
    username: string;
    password?: string;
  };
  bearerToken?: string;
}
export async function callExternalApi<T = any>(url: string, options: ApiCallOptions = {}): Promise<T> {
  const {
    method = 'GET',
    headers: customHeaders,
    body,
    basicAuth,
    bearerToken,
    ...restOptions
  } = options;

  const headers = new Headers(customHeaders as HeadersInit);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (!headers.has('Authorization')) {
    if (bearerToken) {
      headers.set('Authorization', `Bearer ${bearerToken}`);
    } else if (basicAuth) {
      const authString = Buffer.from(`${basicAuth.username}:${basicAuth.password || ''}`).toString('base64');
      headers.set('Authorization', `Basic ${authString}`);
    }
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
    ...restOptions,
  };

  if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    fetchOptions.body = JSON.stringify(body);
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
    method: 'GET',
    basicAuth: {
      username: process.env.API_USER || '',
      password: process.env.API_PASSWORD || ''
    }
  });
}
