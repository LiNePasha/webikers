import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const WP_API_BASE = process.env.NEXT_PUBLIC_WP_API_URL?.replace('/wp-json', '') || 'https://api.spare2app.com';
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, quantity = 1 } = body;

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
      console.log("🔓 Guest user - using client-side cart only");
      return NextResponse.json({
        success: true,
        message: 'Added to local cart (guest mode)',
        data: { product_id, quantity },
        guest_mode: true,
        authenticated: false,
      });
    }

    // For authenticated users, try to sync with WooCommerce
    console.log("🔐 Authenticated user detected - attempting WooCommerce sync...");
    console.log("📍 API Base URL:", WP_API_BASE);
    
    try {
      // Verify token and get user info
      const userResponse = await fetch(`${WP_API_BASE}/wp-json/wp/v2/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error("❌ Token verification failed:", userResponse.status, errorText);
        return NextResponse.json({
          success: true,
          message: 'Added to local cart (authentication expired)',
          data: { product_id, quantity },
          authenticated: false,
          token_expired: true,
        });
      }

      const userData = await userResponse.json();
      console.log("✅ User verified:", userData.name, `(ID: ${userData.id})`);

      // Add item to WooCommerce cart using Store API
      const addToCartUrl = `${WP_API_BASE}/wp-json/wc/store/v1/cart/add-item`;
      
      console.log("🛒 Attempting to add to WooCommerce cart...", { product_id, quantity, url: addToCartUrl });
      
      const cartResponse = await fetch(addToCartUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: product_id,
          quantity: quantity,
        }),
      });

      if (!cartResponse.ok) {
        const errorText = await cartResponse.text();
        console.error('❌ WooCommerce cart sync failed:', cartResponse.status, errorText);
        return NextResponse.json({
          success: true,
          message: 'Added to local cart (WooCommerce sync failed)',
          data: { product_id, quantity },
          authenticated: true,
          synced: false,
          user: { id: userData.id, name: userData.name },
        });
      }

      const cartData = await cartResponse.json();
      console.log("✅ Successfully synced with WooCommerce cart");

      return NextResponse.json({
        success: true,
        message: 'Product added to cart and synced with WooCommerce',
        data: cartData,
        authenticated: true,
        synced: true,
        user: { id: userData.id, name: userData.name },
      });
    } catch (error) {
      console.error('❌ WooCommerce sync error:', error);
      return NextResponse.json({
        success: true,
        message: 'Added to local cart (sync error)',
        data: { product_id, quantity },
        authenticated: true,
        synced: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to add product to cart',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
