import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const WP_API_BASE = process.env.NEXT_PUBLIC_WP_API_URL?.replace('/wp-json', '') || 'https://api.spare2app.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, quantity } = body;

    if (!product_id || quantity === undefined) {
      return NextResponse.json(
        { success: false, message: 'Product ID and quantity are required' },
        { status: 400 }
      );
    }

    // Get JWT token from cookie (optional for cart)
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt_token')?.value;

    // For guest users, just return success (client-side cart only)
    if (!token) {
      return NextResponse.json({
        success: true,
        message: 'Cart updated locally (guest mode)',
        data: { product_id, quantity },
        guest_mode: true,
      });
    }

    // For authenticated users, try to sync with WooCommerce
    try {
      const updateCartUrl = `${WP_API_BASE}/wp-json/wc/store/v1/cart/update-item`;
      
      const cartResponse = await fetch(updateCartUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: product_id.toString(),
          quantity: quantity,
        }),
      });

      if (!cartResponse.ok) {
        return NextResponse.json({
          success: true,
          message: 'Cart updated locally (WooCommerce sync pending)',
          data: { product_id, quantity },
        });
      }

      const cartData = await cartResponse.json();

      return NextResponse.json({
        success: true,
        message: 'Cart updated successfully',
        data: cartData,
        synced: true,
      });
    } catch (error) {
      return NextResponse.json({
        success: true,
        message: 'Cart updated locally',
        data: { product_id, quantity },
      });
    }

  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update cart',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
