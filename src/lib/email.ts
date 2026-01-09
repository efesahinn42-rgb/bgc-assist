import { Resend } from "resend";

// Resend client'ı oluştur (API key kontrolü ile)
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("❌ RESEND_API_KEY environment variable bulunamadı!");
    return null;
  }
  
  // API key format kontrolü (Resend API key'leri "re_" ile başlar)
  if (!apiKey.startsWith("re_")) {
    console.warn("⚠️ RESEND_API_KEY formatı beklenen formatta değil (re_ ile başlamalı)");
  }
  
  return new Resend(apiKey);
};

interface ApplicationEmailData {
  fullName: string;
  tcNo: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  address?: string;
  plate: string;
  brand: string;
  model?: string;
  year?: string;
  packageName: string;
  packagePrice?: number;
}

export async function sendApplicationEmail(
  applicationData: ApplicationEmailData,
  companyEmail: string
) {
  try {
    // Resend client kontrolü
    const resend = getResendClient();
    if (!resend) {
      throw new Error("RESEND_API_KEY environment variable bulunamadı");
    }

    // Test modu kontrolü: onboarding@resend.dev ile sadece kendi email adresinize gönderebilirsiniz
    const fromEmail = "onboarding@resend.dev";
    const isTestMode = !process.env.TEST_EMAIL || process.env.TEST_EMAIL === companyEmail;
    
    if (fromEmail === "onboarding@resend.dev" && !isTestMode) {
      console.warn("⚠️ Resend test domain'i (onboarding@resend.dev) ile sadece kendi email adresinize gönderebilirsiniz.");
      console.warn("⚠️ TEST_EMAIL environment variable'ını Vercel'e ekleyin veya Resend'de domain verify edin.");
    }

    console.log(`📧 Email gönderiliyor: ${companyEmail}`);
    const apiKey = process.env.RESEND_API_KEY;
    console.log(`🔑 RESEND_API_KEY mevcut: ${apiKey ? 'Evet' : 'Hayır'}`);
    if (apiKey) {
      console.log(`🔑 RESEND_API_KEY format: ${apiKey.startsWith("re_") ? 'Doğru (re_ ile başlıyor)' : 'Uyarı: re_ ile başlamıyor'}`);
    }
    
    // Email HTML template
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="tr">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Yeni Başvuru - BGCAssist</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .container {
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .content {
              padding: 30px 20px;
            }
            .section {
              margin-bottom: 25px;
              padding-bottom: 25px;
              border-bottom: 1px solid #e5e7eb;
            }
            .section:last-child {
              border-bottom: none;
              margin-bottom: 0;
              padding-bottom: 0;
            }
            .section-title {
              font-size: 18px;
              font-weight: 600;
              color: #DC2626;
              margin-bottom: 15px;
              display: flex;
              align-items: center;
            }
            .section-title::before {
              content: '';
              width: 4px;
              height: 20px;
              background-color: #DC2626;
              margin-right: 10px;
              border-radius: 2px;
            }
            .info-row {
              display: flex;
              margin-bottom: 12px;
              align-items: flex-start;
            }
            .info-label {
              font-weight: 600;
              color: #6b7280;
              min-width: 140px;
              font-size: 14px;
            }
            .info-value {
              color: #111827;
              font-size: 14px;
              flex: 1;
            }
            .badge {
              display: inline-block;
              background-color: #DC2626;
              color: white;
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
              margin-top: 5px;
            }
            .footer {
              background-color: #f9fafb;
              padding: 20px;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
              border-top: 1px solid #e5e7eb;
            }
            .footer p {
              margin: 5px 0;
            }
            @media only screen and (max-width: 600px) {
              body {
                padding: 10px;
              }
              .info-row {
                flex-direction: column;
              }
              .info-label {
                min-width: auto;
                margin-bottom: 5px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 Yeni Başvuru Alındı</h1>
            </div>
            <div class="content">
              <div class="section">
                <div class="section-title">Kişisel Bilgiler</div>
                <div class="info-row">
                  <div class="info-label">Ad Soyad:</div>
                  <div class="info-value">${applicationData.fullName}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">TC Kimlik No:</div>
                  <div class="info-value">${applicationData.tcNo}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">E-posta:</div>
                  <div class="info-value">${applicationData.email}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Telefon:</div>
                  <div class="info-value">${applicationData.phone}</div>
                </div>
              </div>
              
              <div class="section">
                <div class="section-title">Adres Bilgileri</div>
                <div class="info-row">
                  <div class="info-label">Şehir:</div>
                  <div class="info-value">${applicationData.city}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">İlçe:</div>
                  <div class="info-value">${applicationData.district}</div>
                </div>
                ${applicationData.address ? `
                <div class="info-row">
                  <div class="info-label">Adres:</div>
                  <div class="info-value">${applicationData.address}</div>
                </div>
                ` : ''}
              </div>
              
              <div class="section">
                <div class="section-title">Araç Bilgileri</div>
                <div class="info-row">
                  <div class="info-label">Plaka:</div>
                  <div class="info-value">
                    ${applicationData.plate}
                    <span class="badge">${applicationData.plate}</span>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-label">Marka:</div>
                  <div class="info-value">${applicationData.brand}</div>
                </div>
                ${applicationData.model ? `
                <div class="info-row">
                  <div class="info-label">Model:</div>
                  <div class="info-value">${applicationData.model}</div>
                </div>
                ` : ''}
                ${applicationData.year ? `
                <div class="info-row">
                  <div class="info-label">Yıl:</div>
                  <div class="info-value">${applicationData.year}</div>
                </div>
                ` : ''}
              </div>
              
              <div class="section">
                <div class="section-title">Paket Bilgileri</div>
                <div class="info-row">
                  <div class="info-label">Paket:</div>
                  <div class="info-value">
                    <strong>${applicationData.packageName}</strong>
                  </div>
                </div>
                ${applicationData.packagePrice ? `
                <div class="info-row">
                  <div class="info-label">Fiyat:</div>
                  <div class="info-value">
                    <strong style="color: #DC2626; font-size: 16px;">₺${applicationData.packagePrice.toLocaleString('tr-TR')}</strong>
                  </div>
                </div>
                ` : ''}
              </div>
            </div>
            <div class="footer">
              <p><strong>BGCAssist</strong> - Yol Yardım Hizmetleri</p>
              <p>Bu email otomatik olarak gönderilmiştir.</p>
              <p>Başvuruyu admin panelinden görüntüleyebilirsiniz.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // From email adresi - Test modu için onboarding@resend.dev kullan
    // Production'da domain verify edildikten sonra kendi domain'inizi kullanın
    const fromEmail = "onboarding@resend.dev"; // Test modu için sadece email adresi
    
    const emailPayload = {
      from: fromEmail,
      to: [companyEmail],
      subject: `Yeni Başvuru: ${applicationData.fullName} - ${applicationData.packageName}`,
      html: emailHtml,
    };

    console.log("📤 Resend API'ye gönderiliyor:", {
      to: emailPayload.to,
      subject: emailPayload.subject,
      from: emailPayload.from,
    });

    const { data, error } = await resend.emails.send(emailPayload);

    if (error) {
      // Error'u any olarak cast et çünkü Resend'in ErrorResponse tipinde tüm property'ler tanımlı değil
      const errorAny = error as any;
      
      // Detaylı error logging
      console.error("❌ Resend API Error Detayları:", {
        statusCode: errorAny?.statusCode,
        name: errorAny?.name,
        message: errorAny?.message,
        // Resend error objesi genellikle bu alanları içerir
        ...(typeof error === 'object' && error !== null ? errorAny : {}),
      });
      
      // Error response'un tam detaylarını logla
      if (error && typeof error === 'object') {
        console.error("❌ Resend Error Object:", JSON.stringify(errorAny, null, 2));
      }
      
      throw error;
    }

    console.log("✅ Email başarıyla gönderildi:", data);
    return { success: true, data };
  } catch (error: any) {
    // Error'u any olarak kullan çünkü farklı error tipleri olabilir
    const errorAny = error as any;
    
    // Detaylı error logging - tüm error bilgilerini logla
    console.error("❌ Email gönderme hatası (Catch Block):", {
      message: errorAny?.message,
      name: errorAny?.name,
      statusCode: errorAny?.statusCode,
      stack: errorAny?.stack,
      response: errorAny?.response,
      // Error objesinin tüm özelliklerini logla
      errorObject: error && typeof error === 'object' ? JSON.stringify(errorAny, Object.getOwnPropertyNames(errorAny), 2) : error,
    });
    
    // Error'un tam detaylarını stringify ile logla
    try {
      console.error("❌ Full Error Details:", JSON.stringify(errorAny, null, 2));
    } catch (stringifyError) {
      console.error("❌ Error stringify edilemedi:", stringifyError);
    }
    
    throw error;
  }
}
