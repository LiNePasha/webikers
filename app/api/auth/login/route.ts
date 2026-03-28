import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'https://api.spare2app.com/wp-json'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      )
    }

    console.log('🔐 [Login API] Calling WordPress API:', `${API_URL}/custom/v1/login`)

    // Call WordPress API
    const response = await axios.post(
      `${API_URL}/custom/v1/login`,
      {
        username: email, // Can be email or username
        password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: false,
      }
    )

    console.log('✅ [Login API] WordPress response:', response.data)

    // Return success response
    return NextResponse.json({
      success: true,
      ...response.data,
    })

  } catch (error: any) {
    console.error('❌ [Login API] Error:', error.response?.data || error.message)

    // Handle WordPress errors
    if (error.response?.data) {
      return NextResponse.json(
        {
          success: false,
          message: error.response.data.message || 'فشل تسجيل الدخول',
          ...error.response.data,
        },
        { status: error.response.status || 401 }
      )
    }

    // Handle network errors
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ في الاتصال بالخادم. يرجى المحاولة لاحقاً',
      },
      { status: 500 }
    )
  }
}
