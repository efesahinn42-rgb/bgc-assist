# Favicon Logo Güncellemesi

Favicon olarak logo dosyasını (`/logos/logo-assist.png`) kullanmak için güncelleme yapıyoruz.

## Değişiklikler

### 1. src/app/layout.tsx

**Konum**: Metadata icons bölümü (satır 43-47)

**Değişiklikler**:
- `icon: "/logo.png"` → `icon: "/logos/logo-assist.png"`
- `apple: "/logo.png"` → `apple: "/logos/logo-assist.png"`
- `shortcut: "/logo.png"` → `shortcut: "/logos/logo-assist.png"`

**Detaylar**:
- Metadata'daki tüm icon path'leri `/logos/logo-assist.png` olarak güncellenecek
- OpenGraph ve Twitter image'ları da kontrol edilebilir (şu anda `/logo.png` kullanıyor)

### 2. src/app/icon.png (Opsiyonel)

Next.js App Router'da `app/icon.png` dosyası otomatik olarak favicon olarak kullanılır. Eğer bu dosya varsa ve farklı bir logo kullanıyorsa, logo dosyasıyla değiştirilebilir veya metadata yeterli olabilir.

## Notlar

- Next.js metadata API ile favicon ayarlanıyor
- Logo dosyası: `/public/logos/logo-assist.png`
- Mevcut `/logo.png` path'i artık kullanılmıyor olabilir, kontrol edilmeli
