import { auth } from './auth.js';

async function request(method, url, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = auth.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);

  if (res.status === 401 && !url.startsWith('/auth/')) {
    auth.clear();
    window.location.hash = '#/login';
    throw new Error('Session expired');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  get:   (url)        => request('GET', url),
  post:  (url, body)  => request('POST', url, body),
  patch: (url, body)  => request('PATCH', url, body),
};
