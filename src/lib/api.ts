import CryptoJS from "crypto-js";

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

async function callExternalApi(
  url: string,
  options: ApiCallOptions = {}
){
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
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error(`Failed to fetch external API: ${url} (${response.status})`);
  }
}

export async function getRoomsFromApi(search: string): Promise<any> {
  const url = `https://api.epfl.ch/v1/rooms?query=${encodeURIComponent(search)}`;

  return await callExternalApi(url, {
    basicAuth: {
      username: process.env.API_USER || '',
      password: process.env.API_PASSWORD || ''
    }
  });
}

export async function getRoomFromApiById(id: number): Promise<any> {
  const url = `https://api.epfl.ch/v1/rooms/${id}`;

  return await callExternalApi(url, {
    basicAuth: {
      username: process.env.API_USER || '',
      password: process.env.API_PASSWORD || ''
    }
  });
}

function getAccessSignature(date: string, uri: string, body: Record<string, string>): string {
  let signature = `${date}:${uri}:${getQueryString(body, ':')}:timezoneoffset:0:`;
  const binary = CryptoJS.HmacSHA256(signature, process.env.RMM_ENCRYPTED_KEY!);
  return CryptoJS.enc.Base64.stringify(binary);
}

function getQueryString (body: Record<string, string>, separator: string) {
  const queryString: string[] = [];
  const sortedKeys = Object.keys(body).sort();
  for (const key of sortedKeys) {
    queryString.push(`${key}${separator === ':' ? ':' : '='}${body[key]}`);
  }
  return queryString.join(separator);
}

export async function callRMM(uri: string, method: 'GET' | 'POST', body: Record<string, string>) {
  const url = `${process.env.RMM_URL}${uri}?${getQueryString(body, '&')}&timezoneoffset=0`;
  const date = String(Date.now());

  const authorization = process.env.RMM_ACCESS_KEY + ":" + getAccessSignature(date, uri, body);

  return await callExternalApi(url, {
    headers: {
      Accept: "application/vnd.sciquest-v1+json",
      "x-sciq-date": date,
      Authorization: authorization
    },
    method: method
  });
}
