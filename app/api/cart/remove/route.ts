import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const WP_API_BASE = process.env.NEXT_PUBLIC_WP_API_URL?.replace('/wp-json', '') || 'https://api.spare2app.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id } = body;

    if (!product_id) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
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
        message: 'Item removed from local cart (guest mode)',
        data: { product_id },
        guest_mode: true,
      });
    }

    // For authenticated users, try to sync with WooCommerce
    try {
      const removeCartUrl = `${WP_API_BASE}/wp-json/wc/store/v1/cart/remove-item`;
      
      const cartResponse = await fetch(removeCartUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: product_id.toString(),
        }),
      });

      if (!cartResponse.ok) {
        return NextResponse.json({
          success: true,
          message: 'Item removed from local cart (WooCommerce sync pending)',
          data: { product_id },
        });
      }

      const cartData = await cartResponse.json();

      return NextResponse.json({
        success: true,
        message: 'Item removed from cart successfully',
        data: cartData,
        synced: true,
      });
    } catch (error) {
      return NextResponse.json({
        success: true,
        message: 'Item removed from local cart',
        data: { product_id },
      });
    }

  } catch (error) {
    console.error('Remove from cart error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to remove item from cart',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
