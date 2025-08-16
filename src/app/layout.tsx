import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fadetrack",
  description: "Track haircuts, discover top barbers, manage professional profiles.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      // Use the new logo for app/browser icons
      { url: "/fadetrack-logo-new.svg", type: "image/svg+xml" }
    ],
    shortcut: ["/favicon.ico"],
    apple: ["/fadetrack-logo-new.svg"],
  },
  openGraph: {
    title: "Fadetrack",
    description: "Log your haircuts, find professionals, and stay sharp.",
    url: "https://your-domain.example", // update with real domain
    siteName: "Fadetrack",
    // Use the new logo for social previews as well
    images: [
      { url: "/fadetrack-logo-new.svg", width: 1200, height: 630, alt: "Fadetrack Social Preview" },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fadetrack",
    description: "Log your haircuts, find professionals, and stay sharp.",
    images: ["/fadetrack-logo-new.svg"],
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
        <link rel="icon" href="/fadetrack-logo-new.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
