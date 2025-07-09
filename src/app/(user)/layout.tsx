import React from "react";
import Script from "next/script";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import "@/assets/css/style.css";
import { LoadingProvider } from '@/context/LoadingContext';
import GlobalLoader from '@/components/GlobalLoader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { CartProvider } from '@/context/CartContext';
import { Teko, Roboto, Inter } from 'next/font/google';
const teko = Teko({
  subsets: ['latin'],
  variable: '--font-teko',
  weight: ['300', '400', '500', '600', '700'],
});

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
  weight: ['100', '300', '400', '500', '700', '900'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['100', '300', '400', '500', '700', '900'],
});
export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${teko.variable} ${roboto.variable} ${inter.variable}`}>
        <LoadingProvider>
          <CartProvider>
            <Header />
            <GlobalLoader />
            <LoadingOverlay />
            {children}
          </CartProvider>
        </LoadingProvider>
        <Footer />
        <Script
          src="https://cdn.jsdelivr.net/npm/alpinejs@2.8.2/dist/alpine.min.js"
          strategy="afterInteractive"
        />
        {/* <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          strategy="afterInteractive"
        /> */}
    </div>
  );
}
