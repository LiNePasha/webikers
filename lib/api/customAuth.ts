import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'http://localhost:8000/wp-json';

export async function customRegister({ username, email, password, name }: { username: string; email: string; password: string; name?: string }) {
  // Use Next.js API route as proxy to avoid CORS issues
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      email,
      password,
      name,
    }),
  });

  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.message || 'فشل إنشاء الحساب');
  }
  
  return data;
}

export async function customLogin({ email, password }: { email: string; password: string }) {
  // Use Next.js API route as proxy to avoid CORS issues
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.message || 'فشل تسجيل الدخول');
  }
  
  return data;
}

export async function getUserInfo() {
  // نستخدم endpoint محلي يقرأ الكوكي ويرسل الريكوست لووردبريس
  const res = await fetch('/api/auth/me');
  if (!res.ok) {
    throw new Error('Failed to get user info');
  }
  return res.json();
}

export async function setJwtCookie(token: string) {
  console.log('[setJwtCookie] Setting cookie with token:', token.substring(0, 20) + '...');
  const res = await fetch('/api/auth/set-cookie', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  const data = await res.json();
  console.log('[setJwtCookie] Response:', data);
  if (!res.ok) {
    throw new Error('Failed to set cookie');
  }
  return data;
}

export async function clearJwtCookie() {
  await fetch('/api/auth/logout', { method: 'POST' });
}
