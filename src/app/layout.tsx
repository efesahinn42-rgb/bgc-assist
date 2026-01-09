import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BGCAssist - 7/24 Premium Yol Yardım Hizmeti",
  description: "Türkiye'nin en güvenilir yol yardım hizmeti. Çekici, akü takviye, lastik değişimi ve daha fazlası için 7/24 yanınızdayız.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  openGraph: {
    title: "BGCAssist - 7/24 Premium Yol Yardım Hizmeti",
    description: "Türkiye'nin en güvenilir yol yardım hizmeti. Çekici, akü takviye, lastik değişimi ve daha fazlası için 7/24 yanınızdayız.",
    type: "website",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: "BGCAssist - 7/24 Premium Yol Yardım Hizmeti",
    description: "Türkiye'nin en güvenilir yol yardım hizmeti. Çekici, akü takviye, lastik değişimi ve daha fazlası için 7/24 yanınızdayız.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
