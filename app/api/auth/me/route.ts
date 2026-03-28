import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt_token')?.value;
    
    console.log('[/api/auth/me] Token from cookie:', token ? 'EXISTS' : 'NOT FOUND');
    
    if (!token) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        debug: 'No jwt_token cookie found'
      }, { status: 401 });
    }
    
    // إرسال الريكوست لووردبريس مع التوكن في الهيدر
    const API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'http://localhost:8000/wp-json';
    console.log('[/api/auth/me] Calling WordPress:', `${API_URL}/custom/v1/me`);
    
    const res = await fetch(`${API_URL}/custom/v1/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    console.log('[/api/auth/me] WordPress response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('[/api/auth/me] WordPress error:', errorText);
      return NextResponse.json({ 
        error: 'Failed to get user info',
        debug: `WordPress returned ${res.status}: ${errorText}`
      }, { status: res.status });
    }
    
    const data = await res.json();
    console.log('[/api/auth/me] Success, user:', data.user?.email);
    return NextResponse.json(data);
  } catch (e: any) {
    console.error('[/api/auth/me] Exception:', e.message);
    return NextResponse.json({ 
      error: 'Internal server error',
      debug: e.message
    }, { status: 500 });
  }
}
