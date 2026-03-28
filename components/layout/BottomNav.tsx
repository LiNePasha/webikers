'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Store, ShoppingCart, User, LogIn } from 'lucide-react'
import { useUserStore } from '@/store/userStore'
import useShoppingCart from '@/store/cartStore'

export default function BottomNav() {
  const pathname = usePathname()
  const { user } = useUserStore()
  const { cartQuantity, openCart } = useShoppingCart()
  
  const isAuthenticated = !!user

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault()
    openCart()
  }

  const navItems = [
    {
      icon: Home,
      label: 'الرئيسية',
      href: '/',
      active: pathname === '/',
    },
    {
      icon: Store,
      label: 'المنتجات',
      href: '/products',
      active: pathname.startsWith('/products'),
    }, 
    {
      icon: ShoppingCart,
      label: 'السلة',
      href: '#',
      active: false,
      onClick: handleCartClick,
      badge: cartQuantity,
    },
    {
      icon: isAuthenticated ? User : LogIn,
      label: isAuthenticated ? 'حسابي' : 'دخول',
      href: isAuthenticated ? '/account' : '/auth/login',
      active: pathname.startsWith('/account') || pathname.startsWith('/auth/login'),
    },
  ]

  return (
    <>
      {/* Spacer to prevent content from being hidden behind fixed bottom nav */}
      <div className="h-20 md:hidden" />
      
      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <div className="grid h-16 grid-cols-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.active
            
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={item.onClick}
                className={`
                  flex flex-col items-center justify-center gap-1 relative
                  transition-all duration-200 active:scale-95
                  ${isActive 
                    ? 'text-primary-600' 
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                <div className="relative">
                  <Icon 
                    className={`w-6 h-6 transition-transform duration-200 ${
                      isActive ? 'scale-110' : ''
                    }`} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  
                  {/* Cart Badge */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-primary-600 text-white text-[10px] font-bold rounded-full border-2 border-white animate-pulse">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                  
                  {/* Active Indicator Dot */}
                  {isActive && (
                    <span className="absolute w-1 h-1 -translate-x-1/2 rounded-full -bottom-1 left-1/2 bg-primary-600" />
                  )}
                </div>
                
                <span className={`text-[11px] font-medium transition-all duration-200 ${
                  isActive ? 'font-semibold' : ''
                }`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
