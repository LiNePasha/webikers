'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

export default function ConditionalNavbar() {
  const pathname = usePathname()
  
  // إخفاء Navbar في صفحات المتاجر
  const hideNavbar = pathname?.startsWith('/stores/')
  
  if (hideNavbar) {
    return null
  }
  
  return <Navbar />
}
