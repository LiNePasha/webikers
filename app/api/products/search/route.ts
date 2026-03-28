import { NextRequest, NextResponse } from 'next/server';

const WOOCOMMERCE_API_URL = process.env.NEXT_PUBLIC_WOOCOMMERCE_API_URL || 'https://api.spare2app.com/wp-json/wc/v3';
const CONSUMER_KEY = process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET || '';

interface Product {
  id: number;
  name: string;
  slug: string;
  images: Array<{ src: string }>;
  price: string;
  meta_data: Array<{ key: string; value: string }>;
  categories: Array<{ name: string }>;
  vendor?: {
    id: number;
    name: string;
    store_name: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.length < 2) {
      return NextResponse.json({
        success: false,
        message: 'Search query must be at least 2 characters long',
        products: []
      });
    }

    // Get vendor ID from environment (for single vendor mode)
    const vendorId = process.env.NEXT_PUBLIC_VENDOR_ID || '22';

    // Search in WooCommerce products (try with vendor parameter)
    const searchUrl = `${WOOCOMMERCE_API_URL}/products?search=${encodeURIComponent(query)}&per_page=50&vendor=${vendorId}&consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.status}`);
    }

    const products: Product[] = await response.json();

    // IMPORTANT: Manual filter by vendor ID (in case API doesn't support vendor parameter)
    const vendorProducts = products.filter(product => {
      const productVendorId = product.meta_data?.find(
        (meta: any) => meta.key === '_wcfm_product_author'
      )?.value || product.vendor?.id?.toString();
      
      return productVendorId === vendorId;
    });

    console.log(`🔍 Search results: ${products.length} total, ${vendorProducts.length} from vendor ${vendorId}`);

    // Format products for motorcycle marketplace
    const formattedProducts = vendorProducts.map(product => {
      // Extract motorcycle-specific meta data
      const brand = product.meta_data.find(meta => meta.key === 'motorcycle_brand')?.value || '';
      const model = product.meta_data.find(meta => meta.key === 'motorcycle_model')?.value || '';
      const oemNumber = product.meta_data.find(meta => meta.key === 'oem_number')?.value || '';
      const partCategory = product.categories?.[0]?.name || '';

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0]?.src || '',
        price: product.price,
        brand,
        model,
        part_category: partCategory,
        oem_number: oemNumber,
        vendor: product.vendor
      };
    });

    // Also search by OEM number if query looks like a part number
    let oemResults: any[] = [];
    if (/^[A-Z0-9\-_]+$/i.test(query)) {
      try {
        const oemUrl = `${WOOCOMMERCE_API_URL}/products?meta_key=oem_number&meta_value=${encodeURIComponent(query)}&per_page=20&vendor=${vendorId}&consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;
        const oemResponse = await fetch(oemUrl);
        
        if (oemResponse.ok) {
          const oemProducts: Product[] = await oemResponse.json();
          
          // Filter OEM results by vendor too
          const vendorOemProducts = oemProducts.filter(product => {
            const productVendorId = product.meta_data?.find(
              (meta: any) => meta.key === '_wcfm_product_author'
            )?.value || product.vendor?.id?.toString();
            
            return productVendorId === vendorId;
          });
          
          oemResults = vendorOemProducts.map(product => {
            const brand = product.meta_data.find(meta => meta.key === 'motorcycle_brand')?.value || '';
            const model = product.meta_data.find(meta => meta.key === 'motorcycle_model')?.value || '';
            const oemNumber = product.meta_data.find(meta => meta.key === 'oem_number')?.value || '';
            const partCategory = product.categories?.[0]?.name || '';

            return {
              id: product.id,
              name: product.name,
              slug: product.slug,
              image: product.images?.[0]?.src || '',
              price: product.price,
              brand,
              model,
              part_category: partCategory,
              oem_number: oemNumber,
              vendor: product.vendor
            };
          });
        }
      } catch (error) {
        console.warn('OEM search failed:', error);
      }
    }

    // Combine and deduplicate results
    const allResults = [...formattedProducts, ...oemResults];
    const uniqueResults = allResults.filter((product, index, array) => 
      array.findIndex(p => p.id === product.id) === index
    );

    return NextResponse.json({
      success: true,
      message: `Found ${uniqueResults.length} products`,
      products: uniqueResults,
      search_query: query
    });

  } catch (error) {
    console.error('Search API error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Search failed. Please try again.',
      products: [],
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    }, { status: 500 });
  }
}