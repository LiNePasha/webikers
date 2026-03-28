import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'http://localhost:8000/wp-json';

// Get user addresses
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
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
    
    // Fetch customer data from WooCommerce
    const wcRes = await fetch(`${API_URL}/wc/v3/customers/${userId}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(
          `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
        ).toString('base64')}`,
      },
    });
    
    if (!wcRes.ok) {
      return NextResponse.json({ error: 'Failed to get addresses' }, { status: wcRes.status });
    }
    
    const customer = await wcRes.json();
    
    return NextResponse.json({
      success: true,
      billing: customer.billing || {},
      shipping: customer.shipping || {},
    });
  } catch (e: any) {
    console.error('[/api/user/addresses] Error:', e.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update user addresses
export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const body = await req.json();
    const { billing, shipping } = body;
    
    // Get user ID first
    const userRes = await fetch(`${API_URL}/custom/v1/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!userRes.ok) {
      return NextResponse.json({ error: 'Failed to authenticate' }, { status: 401 });
    }
    
    const userData = await userRes.json();
    const userId = userData.user?.id;
    
    // Update customer addresses in WooCommerce
    const updateRes = await fetch(`${API_URL}/wc/v3/customers/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${Buffer.from(
          `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
        ).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        billing: billing || {},
        shipping: shipping || {},
      }),
    });
    
    if (!updateRes.ok) {
      return NextResponse.json({ error: 'Failed to update addresses' }, { status: updateRes.status });
    }
    
    const updatedCustomer = await updateRes.json();
    
    return NextResponse.json({
      success: true,
      message: 'تم تحديث العناوين بنجاح',
      billing: updatedCustomer.billing,
      shipping: updatedCustomer.shipping,
    });
  } catch (e: any) {
    console.error('[/api/user/addresses] Error:', e.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
