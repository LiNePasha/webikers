import { NextResponse } from 'next/server'
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api'
import type { ShippingMethod } from '@/types'

// Initialize WooCommerce API
const api = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WOOCOMMERCE_API_URL?.replace('/wp-json/wc/v3', '') || '',
  consumerKey: process.env.WC_CONSUMER_KEY || '',
  consumerSecret: process.env.WC_CONSUMER_SECRET || '',
  version: 'wc/v3',
})

/**
 * GET /api/checkout/shipping-methods
 * 
 * Get available WooCommerce shipping methods
 * 
 * Query params:
 * - city: city ID for zone-based shipping (optional)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('city')
    
    // Get all shipping zones
    const { data: zones } = await api.get('shipping/zones')
    
    const shippingMethods: ShippingMethod[] = []
    
    // Get methods for each zone
    for (const zone of zones) {
      try {
        const { data: methods } = await api.get(`shipping/zones/${zone.id}/methods`)
        
        for (const method of methods) {
          // Only include enabled methods
          if (method.enabled) {
            shippingMethods.push({
              id: `${zone.id}_${method.instance_id}`,
              title: method.title || method.method_title,
              cost: parseFloat(method.settings?.cost?.value || '0'),
              estimatedDays: 3, // Default estimate
              provider: method.method_id,
              zoneId: zone.id.toString(),
              zoneName: zone.name,
              methodId: method.method_id,
              instanceId: method.instance_id,
            })
          }
        }
      } catch (error) {
        console.error(`Error fetching methods for zone ${zone.id}:`, error)
      }
    }
    
    // If city provided, filter by zone locations
    if (cityId) {
      // This would require zone location mapping
      // For now, return all methods
      // In production, you'd match cityId to zone locations
    }
    
    // Sort by cost (cheapest first)
    shippingMethods.sort((a, b) => a.cost - b.cost)
    
    return NextResponse.json({
      success: true,
      data: shippingMethods,
      count: shippingMethods.length,
    })
  } catch (error) {
    console.error('Shipping methods API error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في جلب طرق الشحن',
        message: error instanceof Error ? error.message : 'خطأ غير متوقع',
      },
      { status: 500 }
    )
  }
}
