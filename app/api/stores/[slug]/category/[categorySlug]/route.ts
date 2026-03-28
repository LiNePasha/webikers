import { NextRequest, NextResponse } from 'next/server'
import { wooCommerceAPI } from '@/lib/api/woocommerce'

interface RouteParams {
  params: Promise<{
    slug: string
    categorySlug: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params
    const { slug, categorySlug } = resolvedParams
    
    console.log('🔍 API Route: Fetching category details for store:', slug, 'category:', categorySlug)
    
    // First get the store to find vendor_id
    const store = await wooCommerceAPI.getStore(slug)
    
    if (!store || !store.vendor_id) {
      console.error('❌ API Route: Store not found:', slug)
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }
    
    console.log('🔍 API Route: Fetching categories for Vendor ID:', store.vendor_id)
    
    // Get all categories for this store
    const categories = await wooCommerceAPI.getStoreCategories(store.vendor_id)
    
    // Find the specific category by slug
    const category = categories.find(cat => 
      cat.slug === categorySlug || 
      cat.name.toLowerCase().replace(/\s+/g, '-') === categorySlug
    )
    
    if (!category) {
      console.error('❌ API Route: Category not found:', categorySlug)
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }
    
    // Get products for this specific category
    const productsResponse = await wooCommerceAPI.getStoreProducts(store.vendor_id, {
      category: category.id.toString(),
      per_page: 100 // Get all products to analyze
    })
    
    const products = productsResponse.data || []
    
    // Calculate category insights
    const categoryInsights = {
      total_products: products.length,
      price_stats: {
        min: products.length > 0 ? Math.min(...products.map(p => parseFloat(p.price || '0')).filter(p => p > 0)) : 0,
        max: products.length > 0 ? Math.max(...products.map(p => parseFloat(p.price || '0'))) : 0,
        average: products.length > 0 ? 
          products.reduce((sum, p) => sum + parseFloat(p.price || '0'), 0) / products.length : 0
      },
      availability: {
        in_stock: products.filter(p => p.stock_status === 'instock').length,
        out_of_stock: products.filter(p => p.stock_status === 'outofstock').length,
        on_sale: products.filter(p => p.on_sale).length,
        featured: products.filter(p => p.featured).length
      },
      popular_products: products
        .sort((a, b) => (b.total_sales || 0) - (a.total_sales || 0))
        .slice(0, 5),
      recent_products: products
        .sort((a, b) => new Date(b.date_created || 0).getTime() - new Date(a.date_created || 0).getTime())
        .slice(0, 5)
    }
    
    // Enhanced category data
    const enhancedCategory = {
      ...category,
      insights: categoryInsights,
      store: {
        vendor_id: store.vendor_id,
        name: store.vendor_shop_name || store.vendor_display_name,
        slug: slug
      },
      related_categories: categories.filter(cat => 
        cat.id !== category.id && 
        (cat.parent === category.id || category.parent === cat.id || cat.parent === category.parent)
      ).slice(0, 5),
      meta: {
        seo_title: `${category.name} - ${store.vendor_shop_name || store.vendor_display_name} | سبير تو آب`,
        seo_description: `تسوق من مجموعة ${category.name} في متجر ${store.vendor_shop_name || store.vendor_display_name}. اكتشف ${products.length} منتج عالي الجودة بأفضل الأسعار في سبير تو آب.`,
        canonical_url: `https://api.spare2app.com/stores/${slug}/category/${categorySlug}`,
        last_updated: new Date().toISOString()
      }
    }
    
    console.log('✅ API Route: Successfully fetched category details with', products.length, 'products')
    
    return NextResponse.json({
      category: enhancedCategory,
      success: true
    })
    
  } catch (error: any) {
    console.error('❌ API Route Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch category details',
        details: error.message 
      },
      { status: 500 }
    )
  }
}