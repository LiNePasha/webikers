import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const WC_API_URL = process.env.NEXT_PUBLIC_WP_API_URL?.replace('/wp-json', '') || 'http://localhost:8000';
const WC_KEY = process.env.WC_CONSUMER_KEY || '';
const WC_SECRET = process.env.WC_CONSUMER_SECRET || '';

// Get user orders from WooCommerce
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get user info first
    const API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'http://localhost:8000/wp-json';
    const userRes = await fetch(`${API_URL}/custom/v1/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!userRes.ok) {
      return NextResponse.json({ error: 'Failed to authenticate' }, { status: 401 });
    }
    
    const userData = await userRes.json();
    const userId = userData.user?.id;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }
    
    // Get orders from WooCommerce
    const auth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
    const ordersRes = await fetch(
      `${WC_API_URL}/wp-json/wc/v3/orders?customer=${userId}&per_page=100`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      }
    );
    
    if (!ordersRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: ordersRes.status });
    }
    
    const orders = await ordersRes.json();
    
    return NextResponse.json({
      success: true,
      orders: orders,
    });
  } catch (e: any) {
    console.error('[/api/user/orders] Error:', e.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
