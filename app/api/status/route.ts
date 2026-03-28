import { NextRequest, NextResponse } from 'next/server'
import { wooCommerceAPI } from '@/lib/api/woocommerce'

export async function GET(request: NextRequest) {
  try {
    const result = await wooCommerceAPI.testConnection()
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('❌ API Status Check Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'خطأ في فحص حالة API' 
      },
      { status: 500 }
    )
  }
}