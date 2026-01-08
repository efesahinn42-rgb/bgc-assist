import { Zap, Shield, Star, Users, Crown, Truck, LucideIcon } from "lucide-react";

export interface Package {
  name: string;
  price: string;
  period: string;
  description: string;
  icon: LucideIcon;
  popular: boolean;
  color: string;
  features: string[];
  notIncluded: string[];
}

export const packages: Package[] = [
  {
    name: "Başlangıç",
    price: "299",
    period: "yıllık",
    description: "Bireysel kullanıcılar için ideal başlangıç paketi",
    icon: Zap,
    popular: false,
    color: "bg-blue-500",
    features: [
      "Yılda 2 Yol Yardım Hakkı",
      "Çekici Hizmeti (50 km)",
      "Akü Takviye",
      "Lastik Değişimi",
      "Telefon Desteği",
    ],
    notIncluded: [
      "Sınırsız Km Çekici",
      "Konaklama Desteği",
    ],
  },
  {
    name: "Standart",
    price: "449",
    period: "yıllık",
    description: "Düzenli seyahat edenler için dengeli paket",
    icon: Shield,
    popular: false,
    color: "bg-emerald-500",
    features: [
      "Yılda 4 Yol Yardım Hakkı",
      "Çekici Hizmeti (100 km)",
      "Akü Takviye",
      "Lastik Değişimi",
      "Yakıt İkmali",
      "7/24 Telefon Desteği",
    ],
    notIncluded: [
      "Konaklama Desteği",
    ],
  },
  {
    name: "Premium",
    price: "599",
    period: "yıllık",
    description: "En çok tercih edilen, tam kapsamlı paket",
    icon: Star,
    popular: true,
    color: "bg-brand-red",
    features: [
      "Sınırsız Yol Yardım Hakkı",
      "Çekici Hizmeti (150 km)",
      "Akü Takviye",
      "Lastik Değişimi",
      "Yakıt İkmali",
      "7/24 Öncelikli Destek",
      "1 Gece Konaklama Desteği",
    ],
    notIncluded: [],
  },
  {
    name: "Premium Plus",
    price: "799",
    period: "yıllık",
    description: "Aileniz için ekstra güvence ve konfor",
    icon: Users,
    popular: false,
    color: "bg-purple-500",
    features: [
      "Sınırsız Yol Yardım Hakkı",
      "Çekici Hizmeti (200 km)",
      "Tüm Yol Yardım Hizmetleri",
      "7/24 VIP Destek",
      "2 Gece Konaklama Desteği",
      "Araç Kiralama (1 Gün)",
      "Aile Üyeleri Dahil",
    ],
    notIncluded: [],
  },
  {
    name: "Kurumsal",
    price: "999",
    period: "yıllık",
    description: "Filolar ve kurumsal müşteriler için özel çözüm",
    icon: Crown,
    popular: false,
    color: "bg-amber-500",
    features: [
      "Sınırsız Yol Yardım Hakkı",
      "Sınırsız Km Çekici",
      "Tüm Yol Yardım Hizmetleri",
      "7/24 VIP Destek Hattı",
      "3 Gece Konaklama Desteği",
      "Araç Kiralama (3 Gün)",
      "Özel Müşteri Temsilcisi",
    ],
    notIncluded: [],
  },
  {
    name: "Filo",
    price: "1499",
    period: "yıllık",
    description: "Büyük filolar için özelleştirilmiş VIP paket",
    icon: Truck,
    popular: false,
    color: "bg-slate-700",
    features: [
      "Sınırsız Yol Yardım",
      "Sınırsız Km Çekici",
      "Tüm Hizmetler Dahil",
      "Özel VIP Hat",
      "5 Gece Konaklama",
      "Araç Kiralama (7 Gün)",
      "Filo Yönetim Paneli",
      "Aylık Raporlama",
    ],
    notIncluded: [],
  },
];

// Category to Package mapping for slider buttons
export const categoryToPackageMap: Record<string, string> = {
  "Otomobil": "Standart",
  "Motosiklet": "Premium",
  "Hafif Ticari": "Kurumsal",
  "Ağır Ticari": "Filo",
  "İkame Araç": "Premium Plus",
  "Moto Karavan": "Premium",
};

// Helper function to get package by name
export function getPackageByName(name: string): Package | undefined {
  return packages.find(pkg => pkg.name === name);
}

// Helper function to get package by category
export function getPackageByCategory(category: string): Package | undefined {
  const packageName = categoryToPackageMap[category];
  return packageName ? getPackageByName(packageName) : getPackageByName("Premium");
}

// Get the default/popular package
export function getDefaultPackage(): Package {
  return packages.find(pkg => pkg.popular) || packages[2]; // Premium
}
