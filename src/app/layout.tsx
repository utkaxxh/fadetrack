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
      { url: "/fadetrack-wordmark.svg", type: "image/svg+xml" }
    ],
    shortcut: ["/favicon.ico"],
    apple: ["/fadetrack-wordmark.svg"],
  },
  openGraph: {
    title: "Fadetrack",
    description: "Log your haircuts, find professionals, and stay sharp.",
    url: "https://your-domain.example", // update with real domain
    siteName: "Fadetrack",
    images: [
      { url: "/fadetrack-wordmark.svg", width: 560, height: 120, alt: "Fadetrack Wordmark" },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fadetrack",
    description: "Log your haircuts, find professionals, and stay sharp.",
    images: ["/fadetrack-wordmark.svg"],
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
        <link rel="icon" href="/fadetrack-wordmark.svg" type="image/svg+xml" />
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
