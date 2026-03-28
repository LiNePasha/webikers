/**
 * Custom Image Loader for Next.js
 * This bypasses Vercel's paid Image Optimization service
 * and serves images directly from their source
 */

export default function imageLoader({ src, width, quality }: { 
  src: string; 
  width: number; 
  quality?: number 
}) {
  // Always return the source URL as-is
  // This works for both local and external images
  return src;
}
