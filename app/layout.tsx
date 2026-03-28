import type { Metadata } from "next";
import "./globals.css";
import ConditionalNavbar from "@/components/layout/ConditionalNavbar";
import Footer from "@/components/layout/Footer";
import AuthBootstrap from "@/components/common/AuthBootstrap";
import ShoppingCart from "@/components/cart/ShoppingCart";
import CartFloatingButton from "@/components/cart/CartFloatingButton";
import BottomNav from "@/components/layout/BottomNav";
import ToastContainer from "@/components/common/ToastContainer";

export const metadata: Metadata = {
  metadataBase: new URL('https://webikers.com'),
  title: 'WeBikers - قطع غيار وأكسسوارات السكوترات',
  description: 'متجر WeBikers المتخصص في قطع غيار وأكسسوارات السكوترات في مصر - Honda, Yamaha, Vespa, Kymco - قطع أصلية بأفضل الأسعار',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-pattern">
        <AuthBootstrap />
        <ConditionalNavbar />
        <ShoppingCart />
        <CartFloatingButton />
        <main>{children}</main>
        <Footer />
        <BottomNav />
        <ToastContainer />
      </body>
    </html>
  );
}
