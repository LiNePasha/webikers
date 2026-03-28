import { cookies } from 'next/headers'

export interface AuthUser {
  id: number
  email: string
  display_name: string
  roles: string[]
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('jwt_token')?.value
    
    if (!token) {
      return null
    }
    
    const API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'http://localhost:8000/wp-json'
    const res = await fetch(`${API_URL}/custom/v1/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store'
    })
    
    if (!res.ok) {
      return null
    }
    
    const data = await res.json()
    return data.user || null
  } catch (error) {
    console.error('[getAuthUser] Error:', error)
    return null
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}
