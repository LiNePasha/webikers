import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const WP_API_BASE = process.env.NEXT_PUBLIC_WP_API_URL?.replace('/wp-json', '') || 'https://api.spare2app.com';

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from cookie (optional for cart)
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt_token')?.value;

    // For guest users, return empty cart (client-side cart only)
    if (!token) {
      return NextResponse.json({
        success: true,
        message: 'Using local cart (guest mode)',
        data: { items: [], totals: { total_price: '0' } },
        guest_mode: true,
      });
    }

    // For authenticated users, try to get cart from WooCommerce
    try {
      const cartUrl = `${WP_API_BASE}/wp-json/wc/store/v1/cart`;
      
      const cartResponse = await fetch(cartUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!cartResponse.ok) {
        return NextResponse.json({
          success: true,
          message: 'Using local cart',
          data: { items: [], totals: { total_price: '0' } },
        });
      }

      const cartData = await cartResponse.json();

      return NextResponse.json({
        success: true,
        data: cartData,
        synced: true,
      });
    } catch (error) {
      return NextResponse.json({
        success: true,
        message: 'Using local cart',
        data: { items: [], totals: { total_price: '0' } },
      });
    }

  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to get cart',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
