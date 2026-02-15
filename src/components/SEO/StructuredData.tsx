"use client";

import { useSettings } from "@/lib/settings-context";
import { useEffect } from "react";

export function StructuredData() {
  const { settings } = useSettings();

  useEffect(() => {
    // LocalBusiness Schema
    const localBusinessSchema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": "https://www.bgcassist.com.tr",
      name: "BGCAssist",
      description: "Konya ve Türkiye genelinde 7/24 yol yardım hizmeti. Çekici hizmeti, akü takviye, lastik değişimi, yakıt ikmali ve daha fazlası.",
      url: settings.website || "https://www.bgcassist.com.tr",
      telephone: settings.phone,
      email: settings.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: settings.address,
        addressLocality: settings.city,
        addressCountry: "TR",
      },
      geo: {
        "@type": "GeoCoordinates",
        // Konya coordinates (approximate)
        latitude: "37.8746",
        longitude: "32.4932",
      },
      openingHours: "Mo-Su 00:00-23:59", // 7/24 service
      priceRange: "$$",
      image: "https://www.bgcassist.com.tr/logos/favicon.png",
      logo: "https://www.bgcassist.com.tr/logos/favicon.png",
      sameAs: [
        settings.facebook && settings.facebook,
        settings.instagram && settings.instagram,
        settings.twitter && settings.twitter,
        settings.linkedin && settings.linkedin,
      ].filter(Boolean),
    };

    // Organization Schema
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "BGCAssist",
      url: settings.website || "https://www.bgcassist.com.tr",
      logo: "https://www.bgcassist.com.tr/logos/favicon.png",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: settings.phone,
        contactType: "customer service",
        areaServed: "TR",
        availableLanguage: "Turkish",
      },
      sameAs: [
        settings.facebook && settings.facebook,
        settings.instagram && settings.instagram,
        settings.twitter && settings.twitter,
        settings.linkedin && settings.linkedin,
      ].filter(Boolean),
    };

    // Service Schema - Multiple services
    const services = [
      {
        "@type": "Service",
        serviceType: "Çekici Hizmeti",
        provider: {
          "@type": "LocalBusiness",
          name: "BGCAssist",
        },
        areaServed: {
          "@type": "Country",
          name: "Türkiye",
        },
        description: "Aracınızı güvenle istediğiniz noktaya taşıyoruz. 7/24 kesintisiz çekici hizmeti.",
      },
      {
        "@type": "Service",
        serviceType: "Akü Takviye",
        provider: {
          "@type": "LocalBusiness",
          name: "BGCAssist",
        },
        areaServed: {
          "@type": "Country",
          name: "Türkiye",
        },
        description: "Akünüz bittiğinde dakikalar içinde yanınızdayız. Profesyonel ekipmanlarla güvenli takviye.",
      },
      {
        "@type": "Service",
        serviceType: "Lastik Değişimi",
        provider: {
          "@type": "LocalBusiness",
          name: "BGCAssist",
        },
        areaServed: {
          "@type": "Country",
          name: "Türkiye",
        },
        description: "Lastik patlaması durumunda hızlı yedek lastik değişimi. Yolda kalmayın, biz geliyoruz.",
      },
      {
        "@type": "Service",
        serviceType: "Yakıt İkmali",
        provider: {
          "@type": "LocalBusiness",
          name: "BGCAssist",
        },
        areaServed: {
          "@type": "Country",
          name: "Türkiye",
        },
        description: "Yakıtınız bittiğinde acil yakıt teslimatı. Benzin veya dizel, anında ulaştırıyoruz.",
      },
      {
        "@type": "Service",
        serviceType: "Anahtar Hizmeti",
        provider: {
          "@type": "LocalBusiness",
          name: "BGCAssist",
        },
        areaServed: {
          "@type": "Country",
          name: "Türkiye",
        },
        description: "Araç içinde kalan anahtarlar için çilingir hizmeti. Hasarsız kapı açma garantisi.",
      },
      {
        "@type": "Service",
        serviceType: "Yerinde Onarım",
        provider: {
          "@type": "LocalBusiness",
          name: "BGCAssist",
        },
        areaServed: {
          "@type": "Country",
          name: "Türkiye",
        },
        description: "Basit arızalar için yerinde teknik destek. Uzman teknisyenlerimiz hemen müdahale eder.",
      },
    ];

    // Combine all schemas
    const allSchemas = [
      localBusinessSchema,
      organizationSchema,
      ...services,
    ];

    // Add structured data to page
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(allSchemas);
    script.id = "structured-data";

    // Remove existing structured data if any
    const existing = document.getElementById("structured-data");
    if (existing) {
      existing.remove();
    }

    document.head.appendChild(script);

    // Cleanup
    return () => {
      const scriptElement = document.getElementById("structured-data");
      if (scriptElement) {
        scriptElement.remove();
      }
    };
  }, [settings]);

  return null; // This component doesn't render anything
}
