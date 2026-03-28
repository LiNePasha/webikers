'use client'

import { useState, useEffect } from 'react'
import { wooCommerceAPI } from '@/lib/api/woocommerce'

// Developer-only API monitoring component
export default function DeveloperApiMonitor() {
  const [status, setStatus] = useState<{
    loading: boolean
    success: boolean
    message: string
    details?: any
  }>({
    loading: true,
    success: false,
    message: 'Checking API status...'
  })

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const checkApiStatus = async () => {
    setStatus({ loading: true, success: false, message: 'Checking API status...' })
    
    try {
      const result = await wooCommerceAPI.testConnection()
      setStatus({
        loading: false,
        success: result.success,
        message: result.message
      })
    } catch (error: any) {
      setStatus({
        loading: false,
        success: false,
        message: error.message || 'API connection failed',
        details: error.response?.data || error
      })
    }
  }

  useEffect(() => {
    checkApiStatus()
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`p-4 rounded-lg shadow-lg text-sm max-w-md ${
        status.loading 
          ? 'bg-blue-50 border border-blue-200' 
          : status.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`w-3 h-3 rounded-full mt-1 ${
            status.loading 
              ? 'bg-blue-500 animate-pulse' 
              : status.success 
                ? 'bg-green-500' 
                : 'bg-red-500'
          }`}></div>
          
          <div className="flex-1 min-w-0">
            <div className={`font-medium ${
              status.loading 
                ? 'text-blue-900' 
                : status.success 
                  ? 'text-green-900' 
                  : 'text-red-900'
            }`}>
              {status.loading ? 'API Status Check' : status.success ? 'API Connected' : 'API Error'}
            </div>
            
            <div className={`mt-1 ${
              status.loading 
                ? 'text-blue-700' 
                : status.success 
                  ? 'text-green-700' 
                  : 'text-red-700'
            }`}>
              {status.message}
            </div>
            
            {status.details && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs opacity-75">Error Details</summary>
                <pre className="mt-1 text-xs opacity-75 overflow-auto max-h-32">
                  {JSON.stringify(status.details, null, 2)}
                </pre>
              </details>
            )}
            
            {!status.loading && (
              <button
                onClick={checkApiStatus}
                className={`mt-2 px-2 py-1 text-xs rounded ${
                  status.success 
                    ? 'bg-green-200 text-green-800 hover:bg-green-300' 
                    : 'bg-red-200 text-red-800 hover:bg-red-300'
                }`}
              >
                Recheck
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}