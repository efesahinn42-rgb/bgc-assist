import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StructuredData } from "@/components/SEO/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bgcassist.com.tr"),
  title: "BGCAssist - 7/24 Premium Yol Yardım Hizmeti | Konya ve Türkiye Geneli",
  description: "Konya ve Türkiye genelinde 7/24 yol yardım hizmeti. Çekici hizmeti, akü takviye, lastik değişimi, yakıt ikmali, anahtar hizmeti ve yerinde onarım. Otomobil, motosiklet, ticari araç ve karavan için premium yol yardım paketleri. Acil yol yardım için hemen arayın!",
  keywords: [
    "yol yardım",
    "çekici hizmeti",
    "akü takviye",
    "lastik değişimi",
    "7/24 yol yardım",
    "acil yol yardım",
    "Konya yol yardım",
    "Türkiye yol yardım",
    "premium yol yardım",
    "filo hizmeti",
    "ticari araç yol yardımı",
    "motosiklet yol yardımı",
    "karavan yol yardımı",
    "yakıt ikmali",
    "anahtar hizmeti",
    "yerinde onarım",
    "yol yardım paketi",
    "yol yardım sigortası",
    "BGCAssist",
    "yol yardım Konya",
  ],
  category: "Yol Yardım Hizmetleri",
  icons: {
    icon: "/logos/favicon.png",
    apple: "/logos/favicon.png",
    shortcut: "/logos/favicon.png",
  },
  alternates: {
    canonical: "https://www.bgcassist.com.tr",
  },
  openGraph: {
    title: "BGCAssist - 7/24 Premium Yol Yardım Hizmeti | Konya ve Türkiye Geneli",
    description: "Konya ve Türkiye genelinde 7/24 yol yardım hizmeti. Çekici hizmeti, akü takviye, lastik değişimi, yakıt ikmali, anahtar hizmeti ve yerinde onarım. Otomobil, motosiklet, ticari araç ve karavan için premium yol yardım paketleri.",
    type: "website",
    locale: "tr_TR",
    url: "https://www.bgcassist.com.tr",
    siteName: "BGCAssist",
    images: [
      {
        url: "/logos/logo-assist.png",
        width: 1200,
        height: 630,
        alt: "BGCAssist - 7/24 Premium Yol Yardım Hizmeti",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BGCAssist - 7/24 Premium Yol Yardım Hizmeti",
    description: "Konya ve Türkiye genelinde 7/24 yol yardım hizmeti. Çekici, akü takviye, lastik değişimi ve daha fazlası için yanınızdayız.",
    images: [
      {
        url: "/logos/logo-assist.png",
        width: 1200,
        height: 630,
        alt: "BGCAssist Logo",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
        suppressHydrationWarning
      >
        <StructuredData />
        {children}
      </body>
    </html>
  );
}
