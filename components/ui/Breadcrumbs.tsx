'use client'

import Link from 'next/link'
import { ChevronRightIcon } from '@heroicons/react/24/outline'

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav className={`flex items-center space-x-1 rtl:space-x-reverse text-xs md:text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 rtl:space-x-reverse">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon 
                className="w-3 h-3 md:w-4 md:h-4 text-gray-400 mx-1 md:mx-2 rtl:rotate-180" 
                aria-hidden="true" 
              />
            )}
            
            {item.href && !item.current ? (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-brand-600 transition-colors duration-200 font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <span 
                className={`font-medium ${
                  item.current 
                    ? 'text-gray-900' 
                    : 'text-gray-500'
                }`}
                {...(item.current && { 'aria-current': 'page' })}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}