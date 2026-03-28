import React from 'react'

interface ProductLoaderProps {
  count?: number;
  variant?: 'default' | 'compact' | 'featured';
}

export default function ProductLoader({ count = 1, variant = 'default' }: ProductLoaderProps) {
  const cardClasses = {
    default: 'card h-full',
    compact: 'card h-full',
    featured: 'card h-full bg-gradient-to-br from-brand-50 to-brand-100',
  }

  const heightClasses = {
    default: 'h-64',
    compact: 'h-48', 
    featured: 'h-72',
  }

  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={cardClasses[variant]}>
          <div className="animate-pulse h-full flex flex-col">
            {/* Product Image */}
            <div className={`rounded-t-xl bg-gray-200 w-full ${heightClasses[variant]} mb-4`}></div>
            
            {/* Product Info */}
            <div className="p-4 space-y-3 flex-1 flex flex-col">
              {/* Brand/Vendor */}
              {variant !== 'compact' && (
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              )}
              
              {/* Product Title */}
              <div className="space-y-2 grow">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
              </div>
              
              {/* Tags */}
              {variant !== 'compact' && (
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </div>
              )}
              
              {/* Price */}
              <div className="flex items-center justify-between mt-auto">
                <div className="h-7 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
              
              {/* Stock Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

// Grid Loader for multiple products
export function ProductGridLoader({ count = 8 }: ProductLoaderProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <ProductLoader count={count} />
    </div>
  );
}

// List Loader for product lists
export function ProductListLoader({ count = 5 }: ProductLoaderProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
          <div className="animate-pulse flex items-center space-x-4 w-full">
            {/* Product Image */}
            <div className="rounded-md bg-slate-200 h-20 w-20 flex-shrink-0"></div>
            
            {/* Product Info */}
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              <div className="flex gap-2">
                <div className="h-5 bg-slate-200 rounded-full w-12"></div>
                <div className="h-5 bg-slate-200 rounded-full w-16"></div>
              </div>
            </div>
            
            {/* Price */}
            <div className="flex-shrink-0">
              <div className="h-6 bg-slate-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Search Results Loader
export function SearchResultsLoader({ count = 6 }: ProductLoaderProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex items-center p-3 rounded-lg border border-gray-100">
          <div className="animate-pulse flex items-center w-full">
            {/* Product Image */}
            <div className="w-12 h-12 bg-slate-200 rounded-md ml-3 flex-shrink-0"></div>
            
            {/* Product Info */}
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="flex gap-2">
                <div className="h-4 bg-slate-200 rounded-full w-12"></div>
                <div className="h-4 bg-slate-200 rounded-full w-16"></div>
                <div className="h-4 bg-slate-200 rounded-full w-14"></div>
              </div>
              <div className="h-4 bg-slate-200 rounded w-20"></div>
            </div>
            
            {/* Arrow */}
            <div className="w-5 h-5 bg-slate-200 rounded flex-shrink-0"></div>
          </div>
        </div>
      ))}
    </div>
  );
}