import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  
  const admin = await prisma.admin.upsert({
    where: { email: "admin@bgcassist.com" },
    update: {},
    create: {
      email: "admin@bgcassist.com",
      password: hashedPassword,
      name: "Admin",
      role: "SUPER_ADMIN",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create initial packages
  const packagesData = [
    {
      name: "Standart",
      slug: "standart",
      price: 899,
      period: "Yıllık",
      description: "Bireysel araç sahipleri için temel koruma",
      icon: "Star",
      popular: false,
      color: "bg-blue-500",
      features: [
        "7/24 Çağrı Merkezi",
        "Yılda 2 Çekici Hizmeti",
        "Lastik Değişimi",
        "Akü Takviye",
        "Yakıt İkmali",
      ],
      notIncluded: [
        "İkame Araç",
        "Konaklama Desteği",
      ],
      order: 1,
    },
    {
      name: "Premium",
      slug: "premium",
      price: 1499,
      period: "Yıllık",
      description: "Kapsamlı koruma ve ek avantajlar",
      icon: "Zap",
      popular: true,
      color: "bg-brand-red",
      features: [
        "7/24 Çağrı Merkezi",
        "Sınırsız Çekici Hizmeti",
        "Lastik Değişimi",
        "Akü Takviye",
        "Yakıt İkmali",
        "Anahtar Hizmeti",
        "1 Gün İkame Araç",
      ],
      notIncluded: [
        "Konaklama Desteği",
      ],
      order: 2,
    },
    {
      name: "Premium Plus",
      slug: "premium-plus",
      price: 2199,
      period: "Yıllık",
      description: "VIP hizmet ve tam koruma paketi",
      icon: "Crown",
      popular: false,
      color: "bg-amber-500",
      features: [
        "7/24 Çağrı Merkezi",
        "Sınırsız Çekici Hizmeti",
        "Lastik Değişimi",
        "Akü Takviye",
        "Yakıt İkmali",
        "Anahtar Hizmeti",
        "3 Gün İkame Araç",
        "Konaklama Desteği",
        "Öncelikli Hizmet",
      ],
      notIncluded: [],
      order: 3,
    },
    {
      name: "Kurumsal",
      slug: "kurumsal",
      price: 3499,
      period: "Yıllık",
      description: "Şirketler için özel filo çözümleri",
      icon: "Shield",
      popular: false,
      color: "bg-emerald-500",
      features: [
        "7/24 Çağrı Merkezi",
        "Sınırsız Çekici Hizmeti",
        "Tüm Standart Hizmetler",
        "Özel Müşteri Temsilcisi",
        "Aylık Raporlama",
        "Fatura Konsolidasyonu",
      ],
      notIncluded: [],
      order: 4,
    },
    {
      name: "Filo",
      slug: "filo",
      price: 5999,
      period: "Yıllık",
      description: "10+ araç için enterprise çözüm",
      icon: "Truck",
      popular: false,
      color: "bg-purple-500",
      features: [
        "Tüm Kurumsal Özellikler",
        "API Entegrasyonu",
        "Özel SLA",
        "7/24 Teknik Destek",
        "Yıllık İndirim",
      ],
      notIncluded: [],
      order: 5,
    },
    {
      name: "Aile",
      slug: "aile",
      price: 1899,
      period: "Yıllık",
      description: "2 araç için ekonomik paket",
      icon: "Users",
      popular: false,
      color: "bg-pink-500",
      features: [
        "2 Araç Kapsamı",
        "7/24 Çağrı Merkezi",
        "Yılda 4 Çekici Hizmeti",
        "Lastik Değişimi",
        "Akü Takviye",
        "Yakıt İkmali",
      ],
      notIncluded: [
        "İkame Araç",
      ],
      order: 6,
    },
  ];

  for (const pkg of packagesData) {
    await prisma.package.upsert({
      where: { slug: pkg.slug },
      update: pkg,
      create: pkg,
    });
  }
  console.log("✅ Packages created:", packagesData.length);

  // Create initial services
  const servicesData = [
    {
      title: "Çekici Hizmeti",
      slug: "cekici-hizmeti",
      description: "Aracınızı güvenle istediğiniz noktaya taşıyoruz",
      icon: "Truck",
      color: "bg-blue-500",
      modalImage: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1920",
      modalDescription: "Profesyonel çekici hizmetimizle aracınızı güvenle taşıyoruz.",
      interventionTime: "20 Dakika",
      coverageArea: "Tüm Türkiye",
      featuresList: ["7/24 Kesintisiz Hizmet", "Modern Çekici Filosu", "Hasarsız Taşıma"],
      order: 1,
    },
    {
      title: "Akü Takviye",
      slug: "aku-takviye",
      description: "Aracınızın aküsü bittiğinde hızlı takviye",
      icon: "Battery",
      color: "bg-emerald-500",
      modalImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1920",
      modalDescription: "Akü takviye hizmetimizle yolda kalmayın.",
      interventionTime: "15 Dakika",
      coverageArea: "Şehir İçi",
      featuresList: ["Hızlı Müdahale", "Profesyonel Ekipman", "Tüm Araç Modelleri"],
      order: 2,
    },
    {
      title: "Lastik Değişimi",
      slug: "lastik-degisimi",
      description: "Yedek lastik montajı ve onarım",
      icon: "Settings",
      color: "bg-amber-500",
      modalImage: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?q=80&w=1920",
      modalDescription: "Lastik patlaması durumunda hızlı yardım.",
      interventionTime: "20 Dakika",
      coverageArea: "Tüm Türkiye",
      featuresList: ["Yerinde Değişim", "Yedek Lastik Montajı", "Lastik Onarımı"],
      order: 3,
    },
    {
      title: "Yakıt İkmali",
      slug: "yakit-ikmali",
      description: "Yakıtınız bittiğinde acil yakıt teslimatı",
      icon: "Fuel",
      color: "bg-purple-500",
      modalImage: "https://images.unsplash.com/photo-1629241290025-6bb716261f5f?q=80&w=1920",
      modalDescription: "Benzin veya dizel, anında ulaştırıyoruz.",
      interventionTime: "25 Dakika",
      coverageArea: "Şehir İçi",
      featuresList: ["Benzin/Dizel", "Hızlı Teslimat", "Uygun Fiyat"],
      order: 4,
    },
    {
      title: "Anahtar Hizmeti",
      slug: "anahtar-hizmeti",
      description: "Araç içinde kalan anahtarlar için çilingir",
      icon: "Key",
      color: "bg-pink-500",
      modalImage: "https://images.unsplash.com/photo-1533558701576-23c65e0272fb?q=80&w=1920",
      modalDescription: "Hasarsız kapı açma garantisi.",
      interventionTime: "30 Dakika",
      coverageArea: "Şehir İçi",
      featuresList: ["Hasarsız Açma", "Tüm Araç Modelleri", "Hızlı Müdahale"],
      order: 5,
    },
    {
      title: "Yerinde Onarım",
      slug: "yerinde-onarim",
      description: "Küçük arızalar için mobil servis",
      icon: "Wrench",
      color: "bg-cyan-500",
      modalImage: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=1920",
      modalDescription: "Mobil ekibimiz küçük arızaları yerinde giderir.",
      interventionTime: "30 Dakika",
      coverageArea: "Şehir İçi",
      featuresList: ["Mobil Servis", "Temel Onarımlar", "Uzman Teknisyen"],
      order: 6,
    },
  ];

  for (const service of servicesData) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }
  console.log("✅ Services created:", servicesData.length);

  // Create initial slider items
  const slidersData = [
    {
      category: "Otomobil",
      title: "Yolda Kalmak Yok, Devam Etmek Var.",
      description: "Binek araçlarınız için 7/24 çekici, yerinde akü ve lastik değişimi hizmeti. Ailenizle güvenle seyahat edin.",
      image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1920&auto=format&fit=crop",
      color: "blue",
      stats: [
        { icon: "Clock", label: "Ort. Varış", value: "18 Dk" },
        { icon: "MapPin", label: "Hizmet Ağı", value: "81 İl" },
        { icon: "Users", label: "Mutlu Müşteri", value: "10K+" },
      ],
      order: 1,
    },
    {
      category: "Motosiklet",
      title: "İki Teker Özgürlüktür, Biz Güvencesiyiz.",
      description: "Motosikletlere özel aparatlı çekicilerimizle, motorunuzu çizmeden, devirmeden güvenle taşıyoruz.",
      image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1920&auto=format&fit=crop",
      color: "orange",
      stats: [
        { icon: "ShieldCheck", label: "Güvenlik", value: "%100" },
        { icon: "Star", label: "Memnuniyet", value: "4.9/5" },
        { icon: "Activity", label: "Operasyon", value: "7/24" },
      ],
      order: 2,
    },
    {
      category: "Hafif Ticari",
      title: "Esnafın Yükünü Hafifletiyoruz.",
      description: "Doblo, Transporter ve Panelvan araçlarınız arızalandığında işiniz aksamasın. Hızlı müdahale ekibi hazır.",
      image: "https://images.unsplash.com/photo-1656426650699-a76ffe479608?q=80&w=1920&auto=format&fit=crop",
      color: "emerald",
      stats: [
        { icon: "Activity", label: "Yük Kapasitesi", value: "3.5 Ton" },
        { icon: "Clock", label: "Müdahale", value: "Hızlı" },
        { icon: "ShieldCheck", label: "Kasko", value: "Var" },
      ],
      order: 3,
    },
    {
      category: "Ağır Ticari",
      title: "Devler Yolda Kalmaz.",
      description: "Tır, Kamyon ve Otobüs filoları için ağır hizmet kurtarıcılarımızla lojistik operasyonlarınız kesintisiz sürsün.",
      image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1920&auto=format&fit=crop",
      color: "slate",
      stats: [
        { icon: "MapPin", label: "Kapsama", value: "Tüm TR" },
        { icon: "Users", label: "Filo Referans", value: "500+" },
        { icon: "Activity", label: "Tonaj", value: "40 Ton" },
      ],
      order: 4,
    },
    {
      category: "İkame Araç",
      title: "Aracınız Servisteyken Konforunuz Sürsün.",
      description: "Kaza veya arıza durumunda aracınız servisteyken size en uygun ikame aracı anında tahsis ediyoruz.",
      image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=1920&auto=format&fit=crop",
      color: "violet",
      stats: [
        { icon: "Car", label: "Araç Filosu", value: "5000+" },
        { icon: "Clock", label: "Teslimat", value: "Anında" },
        { icon: "ShieldCheck", label: "Kasko", value: "Full" },
      ],
      order: 5,
    },
    {
      category: "Moto Karavan",
      title: "Tatil Keyfiniz Yarıda Kalmasın.",
      description: "Karavan tutkunlarına özel yol yardım. Tatil rotanız neresi olursa olsun, BGC Assist orada.",
      image: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=1920&auto=format&fit=crop",
      color: "amber",
      stats: [
        { icon: "MapPin", label: "Bölge", value: "Tüm Kıyılar" },
        { icon: "Activity", label: "Çekici Tipi", value: "Özel" },
        { icon: "Star", label: "Puan", value: "5.0" },
      ],
      order: 6,
    },
  ];

  // Delete existing sliders and create new ones
  await prisma.sliderItem.deleteMany({});
  
  for (const slider of slidersData) {
    await prisma.sliderItem.create({
      data: slider,
    });
  }
  console.log("✅ Sliders created:", slidersData.length);

  // Create initial site settings
  const settingsData = [
    { key: "phone", value: "0850 888 0 155", type: "text", group: "contact" },
    { key: "email", value: "info@bgcassist.com", type: "text", group: "contact" },
    { key: "whatsapp", value: "905302322742", type: "text", group: "contact" },
    { key: "address", value: "Akabe, Şht. Furkan Doğan Cd. Bey Plaza Kat:1 No:3/122, 42020 Karatay/Konya", type: "text", group: "contact" },
    { key: "city", value: "Konya", type: "text", group: "contact" },
    { key: "workingHours", value: "Açık · Kapanış saati: 19:00", type: "text", group: "contact" },
    { key: "website", value: "https://bgcassist.com", type: "text", group: "contact" },
    { key: "instagram", value: "", type: "text", group: "social" },
    { key: "twitter", value: "", type: "text", group: "social" },
    { key: "facebook", value: "", type: "text", group: "social" },
    { key: "linkedin", value: "", type: "text", group: "social" },
  ];

  for (const setting of settingsData) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log("✅ Site settings created:", settingsData.length);

  console.log("✨ Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
