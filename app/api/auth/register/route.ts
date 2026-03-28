import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'https://api.spare2app.com/wp-json'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password, name } = body

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
        { status: 400 }
      )
    }

    console.log('🔐 [Register API] Calling WordPress API:', `${API_URL}/custom/v1/register`)

    // Call WordPress API
    const response = await axios.post(
      `${API_URL}/custom/v1/register`,
      {
        username: username || email.split('@')[0],
        email,
        password,
        name: name || email.split('@')[0],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        // Don't send credentials from server side
        withCredentials: false,
      }
    )

    console.log('✅ [Register API] WordPress response:', response.data)

    // Return success response
    return NextResponse.json({
      success: true,
      ...response.data,
    })

  } catch (error: any) {
    console.error('❌ [Register API] Error:', error.response?.data || error.message)

    // Handle WordPress errors
    if (error.response?.data) {
      return NextResponse.json(
        {
          success: false,
          message: error.response.data.message || 'فشل إنشاء الحساب',
          ...error.response.data,
        },
        { status: error.response.status || 400 }
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
