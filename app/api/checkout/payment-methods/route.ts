import { NextResponse } from 'next/server'
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api'
import type { PaymentMethod } from '@/types'

// Initialize WooCommerce API
const api = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WOOCOMMERCE_API_URL?.replace('/wp-json/wc/v3', '') || '',
  consumerKey: process.env.WC_CONSUMER_KEY || '',
  consumerSecret: process.env.WC_CONSUMER_SECRET || '',
  version: 'wc/v3',
})

/**
 * GET /api/checkout/payment-methods
 * 
 * Get available payment methods (WooCommerce + custom Instapay)
 */
export async function GET() {
  try {
    // Get WooCommerce payment gateways
    const { data: gateways } = await api.get('payment_gateways')
    
    const paymentMethods: PaymentMethod[] = []
    
    // Add enabled WooCommerce gateways
    for (const gateway of gateways) {
      if (gateway.enabled) {
        paymentMethods.push({
          id: gateway.id,
          title: gateway.title,
          description: gateway.description || '',
          enabled: true,
          requiresProof: false, // WC gateways don't need proof
          icon: gateway.icon || undefined,
        })
      }
    }
    
    // Add custom Instapay payment method
    const instapayMethod: PaymentMethod = {
      id: 'instapay',
      title: 'الدفع عبر محفظة Instapay',
      description: `قم بتحويل المبلغ إلى حساب Instapay ثم ارفع صورة إثبات الدفع`,
      enabled: true,
      requiresProof: true, // Requires payment proof image
      icon: '/images/instapay-logo.png',
      accountNumber: process.env.NEXT_PUBLIC_INSTAPAY_ACCOUNT_NUMBER,
      accountName: process.env.NEXT_PUBLIC_INSTAPAY_ACCOUNT_NAME,
    }
    
    // Add Instapay as first option
    paymentMethods.unshift(instapayMethod)
    
    return NextResponse.json({
      success: true,
      data: paymentMethods,
      count: paymentMethods.length,
    })
  } catch (error) {
    console.error('Payment methods API error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في جلب طرق الدفع',
        message: error instanceof Error ? error.message : 'خطأ غير متوقع',
      },
      { status: 500 }
    )
  }
}
