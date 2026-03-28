import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }
    
    // إعداد الكوكي httpOnly لمدة 7 أيام
    const response = NextResponse.json({ success: true, message: 'Cookie set successfully' });
    response.cookies.set('jwt_token', token, {
      httpOnly: true,
      sameSite: 'lax', // تغيير من strict إلى lax لمنع المشاكل
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      secure: process.env.NODE_ENV === 'production',
    });
    
    return response;
  } catch (e) {
    console.error('Set cookie error:', e);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
