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
    // Temel Hizmetler
    "yol yardım",
    "çekici hizmeti",
    "akü takviye",
    "lastik değişimi",
    "yakıt ikmali",
    "anahtar hizmeti",
    "yerinde onarım",
    "araç çekici",
    "araba çekici",
    "otomobil çekici",
    "araç kurtarma",
    "araba kurtarma",
    "otomobil kurtarma",
    "çekici servisi",
    "kurtarma hizmeti",
    "onarım servisi",
    "acil servis",
    "yol yardım servisi",
    "araç servisi",
    "mobil servis",
    "yerinde servis",
    "akü değişimi",
    "akü şarj",
    "akü takviye hizmeti",
    "lastik tamiri",
    "lastik onarımı",
    "yedek lastik",
    "stepne değişimi",
    "yakıt servisi",
    "benzin ikmali",
    "dizel ikmali",
    "anahtar kopyalama",
    "anahtar açma",
    "kilit açma",
    "araç kilidi",
    "motor arızası",
    "elektrik arızası",
    "araba arızası",
    "araç arızası",
    // Zaman Bazlı
    "7/24 yol yardım",
    "acil yol yardım",
    "gece yol yardım",
    "gündüz yol yardım",
    "hafta sonu yol yardım",
    "tatil yol yardım",
    "bayram yol yardım",
    "7/24 çekici",
    "acil çekici",
    "gece çekici",
    "gündüz çekici",
    "hafta sonu çekici",
    "7/24 kurtarma",
    "acil kurtarma",
    "gece kurtarma",
    "anında çekici",
    "hızlı çekici",
    "acil servis çekici",
    // Lokasyon Bazlı
    "Konya yol yardım",
    "Türkiye yol yardım",
    "Konya çekici",
    "Türkiye çekici",
    "Konya kurtarma",
    "Türkiye kurtarma",
    "Konya araç çekici",
    "Türkiye araç çekici",
    "Konya acil servis",
    "Türkiye acil servis",
    "Anadolu yol yardım",
    "İç Anadolu yol yardım",
    "Karatay çekici",
    "Meram çekici",
    "Selçuklu çekici",
    "şehirlerarası çekici",
    "şehirlerarası yol yardım",
    "ülke geneli yol yardım",
    "Türkiye geneli çekici",
    "Konya merkez çekici",
    "Konya ilçeler çekici",
    // Araç Tipleri
    "otomobil yol yardımı",
    "motosiklet yol yardımı",
    "ticari araç yol yardımı",
    "karavan yol yardımı",
    "kamyon yol yardımı",
    "otobüs yol yardımı",
    "minibüs yol yardımı",
    "panelvan yol yardımı",
    "pickup yol yardımı",
    "SUV yol yardımı",
    "otomobil çekici",
    "motosiklet çekici",
    "ticari araç çekici",
    "karavan çekici",
    "kamyon çekici",
    "otobüs çekici",
    "minibüs çekici",
    "panelvan çekici",
    "pickup çekici",
    "SUV çekici",
    "filo hizmeti",
    "kurumsal yol yardım",
    "şirket araçları yol yardım",
    // Hizmet Türleri
    "premium yol yardım",
    "yol yardım paketi",
    "yol yardım sigortası",
    "yol yardım aboneliği",
    "yol yardım üyeliği",
    "yol yardım planı",
    "yol yardım paketleri",
    "yol yardım fiyatları",
    "yol yardım ücreti",
    "yol yardım maliyeti",
    "yol yardım fiyat listesi",
    "yol yardım kampanyası",
    "yol yardım indirimi",
    "yol yardım teklifi",
    "yol yardım başvuru",
    "yol yardım kayıt",
    "yol yardım üyelik",
    "yol yardım abonelik",
    // Sigorta ve Paket
    "kasko yol yardım",
    "trafik sigortası yol yardım",
    "paket sigortası",
    "yol yardım sigorta",
    "araç sigortası yol yardım",
    "otomobil sigortası",
    "yol yardım poliçesi",
    "yol yardım güvencesi",
    // Alternatif Terimler
    "araç taşıma",
    "araba taşıma",
    "otomobil taşıma",
    "araç nakliye",
    "araba nakliye",
    "çekici kiralama",
    "kurtarma aracı",
    "çekici aracı",
    "yardım aracı",
    "servis aracı",
    "mobil tamir",
    "yol kenarı tamir",
    "yol kenarı onarım",
    "yolda kaldım",
    "yolda kaldı",
    "araç yolda kaldı",
    "araba yolda kaldı",
    "araç bozuldu",
    "araba bozuldu",
    "araç arıza",
    "araba arıza",
    "acil araç yardım",
    "acil araba yardım",
    // Marka ve Özel Terimler
    "BGCAssist",
    "BGC Assist",
    "bgc assist",
    "bgcassist yol yardım",
    "bgcassist çekici",
    "bgcassist kurtarma",
  ],
  category: "Yol Yardım Hizmetleri",
  icons: {
    icon: [
      {
        url: "/logos/new-logo.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/logos/new-logo.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/logos/new-logo.png",
        sizes: "48x48",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/logos/new-logo.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: [
      {
        url: "/logos/new-logo.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
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
        url: "/logos/new-logo.png",
        width: 512,
        height: 512,
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
        url: "/logos/new-logo.png",
        width: 512,
        height: 512,
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
