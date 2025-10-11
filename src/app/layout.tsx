import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap'
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ratemymua.com'),
  title: {
    default: "Find & Review Makeup Artists",
    template: "%s | RateMyMUA",
  },
  description: "Discover top makeup artists, share authentic reviews, and build professional profiles.",
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://ratemymua.com',
  },
  icons: {
    icon: [
      { url: "/favicon.png" },
      { url: "/ratemymua-logo.png", type: "image/png" }
    ],
    shortcut: ["/favicon.png"],
    apple: ["/ratemymua-logo.png"],
  },
  openGraph: {
    title: "Find & Review Makeup Artists | RateMyMUA",
    description: "Find and review makeup artists. Showcase your artistry.",
    url: "https://ratemymua.com",
    siteName: "RateMyMUA",
    // Use the new logo for social previews as well
    images: [
      { url: "/ratemymua-logo.png", width: 1200, height: 630, alt: "RateMyMUA Social Preview" },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find & Review Makeup Artists | RateMyMUA",
    description: "Discover and review makeup artists.",
    images: ["/ratemymua-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Primary favicon / app icon */}
        <link rel="icon" href="/favicon.png" type="image/png" />
        {/* ChatKit Script */}
        <script
          src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
          async
        ></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-3M0RLJTFCZ"
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-3M0RLJTFCZ');
              `}
            </Script>
          </>
        )}
        {children}
        <Analytics />
      </body>
    </html>
  );
}
