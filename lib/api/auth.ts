import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'https://your-wp-site.com/wp-json';

export async function login({ email, password }: { email: string; password: string }) {
  const res = await axios.post(`${API_URL}/jwt-auth/v1/token`, {
    username: email,
    password,
  });
  return res.data;
}

// يمكنك إضافة دوال signup, forgotPassword لاحقاً
