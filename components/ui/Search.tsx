'use client'

import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { wooCommerceAPI } from '@/lib/api/woocommerce';

interface SearchResult {
  id: number;
  name: string;
  slug: string;
  brand?: string;
  model?: string;
  part_category?: string;
  oem_number?: string;
  image?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
}

interface SearchProps {
  onSearchOpen?: () => void;
}

export default function Search({ onSearchOpen }: SearchProps = {}) {
    const VENDOR_ID = process.env.NEXT_PUBLIC_VENDOR_ID || '22'
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    function closeModal() {
        setIsSearchOpen(false);
    }

    function openModal() {
        setIsSearchOpen(true);
    }

    // Close modal and sidebar when navigating to a product
    function handleProductClick() {
        closeModal();
        setPopoverOpen(!popoverOpen);
        // Close sidebar if callback provided
        if (onSearchOpen) {
            onSearchOpen();
        }
    }

    useEffect(() => {
        document.body.classList.toggle('overflow-y-hidden', popoverOpen);

        return () => {
            document.body.classList.remove('overflow-y-hidden');
        };
    }, [popoverOpen]);

    // Debounce search query
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            const searchValue = searchQuery.trim()
            console.log('🔍 Search Modal - Setting debounced search:', searchValue)
            setDebouncedSearch(searchValue)
        }, 500)

        return () => clearTimeout(debounceTimer)
    }, [searchQuery])

    // Search products with new API
    useEffect(() => {
        const searchProducts = async () => {
            if (!debouncedSearch || debouncedSearch.length < 2) {
                setSearchResults([]);
                return;
            }

            setIsLoading(true);
            try {
                console.log('📦 Search Modal - Searching for:', debouncedSearch)
                const data = await wooCommerceAPI.getEnhancedStoreProducts(VENDOR_ID, {
                    search: debouncedSearch,
                    per_page: 20
                })
                
                console.log('✅ Search Modal - Results:', data.products?.length || 0)
                setSearchResults(data.products || []);
            } catch (error) {
                console.error('❌ Search Modal - Error:', error);
                setSearchResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        searchProducts();
    }, [debouncedSearch, VENDOR_ID]);

    return (
        <div className="w-full">
            {/* Mobile: Full Bar Button */}
            <button 
                className="md:hidden flex items-center justify-center gap-2 w-full px-4 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all active:scale-[0.98]"
                onClick={() => { openModal(); setPopoverOpen(!popoverOpen); }}
                aria-label="بحث في قطع الغيار"
            >
                <MagnifyingGlassIcon className="w-5 h-5" aria-hidden="true" />
                <span className="text-sm font-medium">ابحث عن قطع غيار، اكسسوارات...</span>
            </button>

            {/* Desktop: Icon Button */}
            <button 
                className="hidden md:flex items-center justify-center w-10 h-10 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all active:scale-95"
                onClick={() => { openModal(); setPopoverOpen(!popoverOpen); }}
                aria-label="بحث في قطع الغيار"
            >
                <MagnifyingGlassIcon className="w-5 h-5" aria-hidden="true" />
            </button>

            {isSearchOpen && (
                <Modal 
                    isOpen={isSearchOpen} 
                    onClose={() => { closeModal(); setPopoverOpen(!popoverOpen); }}
                    title="البحث في قطع غيار الموتوسيكلات"
                    size="full"
                >
                    <div className="divide-y divide-gray-200">
                        <div className="px-8 py-5">
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="motorcycle-search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full py-4 pl-5 pr-12 text-black transition-colors border-2 border-brand-400 rounded-lg outline-none focus:border-brand-600"
                                    placeholder="ابحث بالاسم، رقم القطعة، الماركة، أو الموديل..."
                                    autoComplete="off"
                                />
                            </div>

                            {/* Search Suggestions */}
                            <div className="mt-4 text-sm text-gray-600">
                                <p className="mb-2 font-medium">أمثلة للبحث:</p>
                                <div className="flex flex-wrap gap-2">
                                    {['فرامل هوجان Z250', 'وش زيت', 'إطار خلفي فيجوري', 'مرايات'].map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => setSearchQuery(suggestion)}
                                            className="px-3 py-1 text-xs transition-colors bg-gray-100 rounded-full hover:bg-gray-200"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-5">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-8 h-8 border-b-2 border-brand-600 rounded-full animate-spin"></div>
                                    <span className="mr-3 text-gray-600">جاري البحث...</span>
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold">نتائج البحث ({searchResults.length})</h3>
                                        <Link
                                            href={`/products?search=${encodeURIComponent(debouncedSearch)}`}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all bg-brand-500 rounded-lg hover:bg-brand-600 active:scale-95"
                                            onClick={handleProductClick}
                                        >
                                            <span>عرض الكل</span>
                                            <ChevronLeftIcon className="w-4 h-4" />
                                        </Link>
                                    </div>
                                    <div className="space-y-3 overflow-y-auto max-h-96">
                                        {searchResults.map((product) => (
                                            <Link 
                                                key={product.id}
                                                href={`/products/${product.slug}`}
                                                className="flex items-center p-3 transition-colors border border-gray-100 rounded-lg hover:bg-gray-50"
                                                onClick={handleProductClick}
                                            >
                                                {product.image && (
                                                    <img 
                                                        src={product.image} 
                                                        alt={product.name}
                                                        className="object-cover w-12 h-12 ml-3 rounded-md shrink-0"
                                                    />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                                                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                                        {product.brand && (
                                                            <span className="bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full text-xs">
                                                                {product.brand}
                                                            </span>
                                                        )}
                                                        {product.model && (
                                                            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                                                                {product.model}
                                                            </span>
                                                        )}
                                                        {product.oem_number && (
                                                            <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                                                                #{product.oem_number}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {(product.price || product.sale_price || product.regular_price) && (
                                                        <div className="mt-1 font-semibold text-brand-600">
                                                            {product.sale_price || product.price || product.regular_price} جنيه
                                                        </div>
                                                    )}
                                                </div>
                                                <ChevronLeftIcon className="w-5 h-5 text-gray-400 shrink-0" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : debouncedSearch && debouncedSearch.length >= 2 && !isLoading ? (
                                <div className="py-8 text-center">
                                    <div className="mb-4 text-gray-500">
                                        <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                        <p>لم يتم العثور على نتائج للبحث "<span className="font-semibold">{debouncedSearch}</span>"</p>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <p>جرب:</p>
                                        <ul className="mt-2 space-y-1 list-disc list-inside">
                                            <li>التأكد من كتابة الكلمات بشكل صحيح</li>
                                            <li>استخدام كلمات أكثر عمومية</li>
                                            <li>البحث بالماركة أو الموديل</li>
                                            <li>البحث برقم القطعة OEM</li>
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8 text-center text-gray-500">
                                    <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p>ابدأ بكتابة ما تبحث عنه...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}