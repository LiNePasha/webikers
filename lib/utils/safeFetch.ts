// Safe API fetch with automatic error handling
export async function safeFetch<T>(
  url: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    // Don't set Content-Type when body is FormData — browser sets it automatically
    // with the correct multipart/form-data boundary
    const isFormData = options?.body instanceof FormData
    const response = await fetch(url, {
      ...options,
      headers: isFormData
        ? { ...options?.headers }
        : {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
    })

    // Handle non-OK responses
    if (!response.ok) {
      let errorMessage = `خطأ في الاتصال: ${response.status}`
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        // If can't parse JSON, use status text
        errorMessage = response.statusText || errorMessage
      }

      return {
        data: null,
        error: errorMessage,
        status: response.status,
      }
    }

    // Parse successful response
    const data = await response.json()
    
    return {
      data,
      error: null,
      status: response.status,
    }
  } catch (error: any) {
    // Network errors, timeout, etc.
    console.error('Fetch error:', error)
    
    return {
      data: null,
      error: error.message || 'فشل الاتصال بالسيرفر',
      status: 0,
    }
  }
}

// Retry fetch with exponential backoff
export async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  maxRetries = 3
): Promise<{ data: T | null; error: string | null }> {
  let lastError: string | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const { data, error, status } = await safeFetch<T>(url, options)

    // Success
    if (data && !error) {
      return { data, error: null }
    }

    // Don't retry on client errors (4xx)
    if (status >= 400 && status < 500) {
      return { data: null, error }
    }

    lastError = error

    // Wait before retry (exponential backoff)
    if (attempt < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
    }
  }

  return { data: null, error: lastError || 'فشلت جميع المحاولات' }
}

// Validate API response structure
export function validateResponse<T>(
  data: any,
  validator: (data: any) => data is T
): { valid: true; data: T } | { valid: false; error: string } {
  if (!data) {
    return { valid: false, error: 'لا توجد بيانات' }
  }

  if (!validator(data)) {
    return { valid: false, error: 'تنسيق البيانات غير صحيح' }
  }

  return { valid: true, data }
}

// Type guard helpers
export const isArrayWithItems = (arr: any): arr is any[] => {
  return Array.isArray(arr) && arr.length > 0
}

export const hasProperty = <T extends object, K extends string>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> => {
  return obj && typeof obj === 'object' && key in obj
}
