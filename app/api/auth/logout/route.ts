import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  // حذف الكوكي بإرجاعه منتهي الصلاحية
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.set('jwt_token', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}
