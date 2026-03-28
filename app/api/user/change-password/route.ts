import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'http://localhost:8000/wp-json';

// Change user password
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const body = await req.json();
    const { currentPassword, newPassword } = body;
    
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new passwords are required' }, { status: 400 });
    }
    
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    
    // Get user ID first
    const userRes = await fetch(`${API_URL}/custom/v1/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!userRes.ok) {
      return NextResponse.json({ error: 'Failed to authenticate' }, { status: 401 });
    }
    
    const userData = await userRes.json();
    const userId = userData.user?.id;
    
    // Update password via WordPress API
    const updateRes = await fetch(`${API_URL}/wp/v2/users/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: newPassword,
      }),
    });
    
    if (!updateRes.ok) {
      const errorData = await updateRes.json();
      return NextResponse.json({ error: errorData.message || 'Failed to change password' }, { status: updateRes.status });
    }
    
    return NextResponse.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح',
    });
  } catch (e: any) {
    console.error('[/api/user/change-password] Error:', e.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
