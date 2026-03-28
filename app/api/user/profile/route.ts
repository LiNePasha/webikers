import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'http://localhost:8000/wp-json';

// Get user profile
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const res = await fetch(`${API_URL}/custom/v1/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to get profile' }, { status: res.status });
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update user profile
export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const body = await req.json();
    
    // Get user ID first
    const userRes = await fetch(`${API_URL}/custom/v1/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!userRes.ok) {
      return NextResponse.json({ error: 'Failed to authenticate' }, { status: 401 });
    }
    
    const userData = await userRes.json();
    const userId = userData.user?.id;
    
    // Update user via WordPress API
    const updateRes = await fetch(`${API_URL}/wp/v2/users/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: body.name,
        first_name: body.name,
        meta: {
          phone: body.phone || '',
        },
      }),
    });
    
    if (!updateRes.ok) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: updateRes.status });
    }
    
    const updatedUser = await updateRes.json();
    
    return NextResponse.json({
      success: true,
      message: 'تم تحديث البيانات بنجاح',
      user: updatedUser,
    });
  } catch (e: any) {
    console.error('[/api/user/profile] Error:', e.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
