'use client'

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  loading?: 'eager' | 'lazy';
  onLoadingComplete?: () => void;
  showLoader?: boolean;
}

/**
 * Optimized Image Component with:
 * - Automatic fallback to /logo.webp
 * - Shimmer loading effect
 * - Error handling with graceful fallback
 * - Performance optimizations (AVIF, WebP)
 * - Responsive sizing
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  quality = 90, // Balanced quality (85-95 recommended)
  sizes,
  objectFit = 'cover',
  loading = 'lazy',
  onLoadingComplete,
  showLoader = true,
}: OptimizedImageProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imageSrc, setImageSrc] = useState(src || '/logo.webp');

  // Update imageSrc when src prop changes
  useEffect(() => {
    if (src && src !== imageSrc) {
      setImageSrc(src);
      // Don't reset to loading state - just update the src
      // The image will load naturally without showing logo fallback
    }
  }, [src]);

  // Fallback to logo if no src provided
  const finalSrc = imageSrc || '/logo.webp';

  const handleLoad = () => {
    setImageState('loaded');
    onLoadingComplete?.();
  };

  const handleError = () => {
    if (imageSrc !== '/logo.webp') {
      setImageSrc('/logo.webp'); // Fallback to logo on error
      setImageState('loading'); // Try loading logo
    } else {
      setImageState('error'); // Even logo failed
    }
  };

  const baseImageProps = {
    alt,
    quality,
    priority,
    loading: priority ? ('eager' as const) : loading,
    onLoad: handleLoad,
    onError: handleError,
    className: `${className} opacity-100 transition-opacity duration-200 ease-in-out`,
  };

  const fillProps = fill
    ? {
        fill: true,
        sizes: sizes || '100vw',
        style: { objectFit },
      }
    : {
        width: width || 400,
        height: height || 400,
        style: { objectFit },
      };

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''} overflow-hidden`}>

      {/* Error State - Show placeholder */}
      {imageState === 'error' && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100"
          style={!fill ? { width: `${width}px`, height: `${height}px` } : {}}
        >
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
              />
            </svg>
            <p className="mt-2 text-xs text-gray-500">صورة غير متوفرة</p>
          </div>
        </div>
      )}

      {/* Actual Image */}
      <Image src={finalSrc} {...baseImageProps} {...fillProps} />
    </div>
  );
}
