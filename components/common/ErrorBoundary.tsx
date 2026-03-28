'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error reporting service
    console.error('ErrorBoundary caught:', error, errorInfo)
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="p-6 border-2 border-red-200 rounded-xl bg-red-50">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">⚠️</span>
            <h3 className="text-lg font-bold text-red-900">حدث خطأ</h3>
          </div>
          <p className="text-sm text-red-700 mb-4">
            عذراً، حدثت مشكلة في تحميل هذا المحتوى
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            🔄 حاول مرة أخرى
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Lightweight version for small components
export function ErrorFallback({ error, reset }: { error: Error; reset?: () => void }) {
  return (
    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
      <p className="text-sm text-red-700 mb-2">⚠️ حدث خطأ في التحميل</p>
      {reset && (
        <button
          onClick={reset}
          className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  )
}
