import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'http://localhost:8000/wp-json';

// Get user wishlist
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
    
    // Get wishlist from user meta
    const metaRes = await fetch(`${API_URL}/wp/v2/users/${userId}?context=edit`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!metaRes.ok) {
      return NextResponse.json({ error: 'Failed to get wishlist' }, { status: metaRes.status });
    }
    
    const user = await metaRes.json();
    const wishlist = user.meta?.wishlist ? JSON.parse(user.meta.wishlist) : [];
    
    // If wishlist has product IDs, fetch product details
    if (wishlist.length > 0) {
      const productsRes = await fetch(
        `${API_URL}/wc/v3/products?include=${wishlist.join(',')}`,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(
              `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
            ).toString('base64')}`,
          },
        }
      );
      
      if (productsRes.ok) {
        const products = await productsRes.json();
        return NextResponse.json({ success: true, wishlist: products });
      }
    }
    
    return NextResponse.json({ success: true, wishlist: [] });
  } catch (e: any) {
    console.error('[/api/user/wishlist GET] Error:', e.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Add to wishlist
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const body = await req.json();
    const { productId } = body;
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
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
    
    // Get current wishlist
    const metaRes = await fetch(`${API_URL}/wp/v2/users/${userId}?context=edit`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!metaRes.ok) {
      return NextResponse.json({ error: 'Failed to get wishlist' }, { status: metaRes.status });
    }
    
    const user = await metaRes.json();
    const wishlist = user.meta?.wishlist ? JSON.parse(user.meta.wishlist) : [];
    
    // Add product if not already in wishlist
    if (!wishlist.includes(productId)) {
      wishlist.push(productId);
    }
    
    // Update wishlist
    const updateRes = await fetch(`${API_URL}/wp/v2/users/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        meta: { wishlist: JSON.stringify(wishlist) },
      }),
    });
    
    if (!updateRes.ok) {
      return NextResponse.json({ error: 'Failed to update wishlist' }, { status: updateRes.status });
    }
    
    return NextResponse.json({
      success: true,
      message: 'تمت الإضافة إلى المفضلة',
      wishlist,
    });
  } catch (e: any) {
    console.error('[/api/user/wishlist POST] Error:', e.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Remove from wishlist
export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const productId = parseInt(searchParams.get('productId') || '0');
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
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
    
    // Get current wishlist
    const metaRes = await fetch(`${API_URL}/wp/v2/users/${userId}?context=edit`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!metaRes.ok) {
      return NextResponse.json({ error: 'Failed to get wishlist' }, { status: metaRes.status });
    }
    
    const user = await metaRes.json();
    const wishlist = user.meta?.wishlist ? JSON.parse(user.meta.wishlist) : [];
    
    // Remove product from wishlist
    const updatedWishlist = wishlist.filter((id: number) => id !== productId);
    
    // Update wishlist
    const updateRes = await fetch(`${API_URL}/wp/v2/users/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        meta: { wishlist: JSON.stringify(updatedWishlist) },
      }),
    });
    
    if (!updateRes.ok) {
      return NextResponse.json({ error: 'Failed to update wishlist' }, { status: updateRes.status });
    }
    
    return NextResponse.json({
      success: true,
      message: 'تمت الإزالة من المفضلة',
      wishlist: updatedWishlist,
    });
  } catch (e: any) {
    console.error('[/api/user/wishlist DELETE] Error:', e.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
