# Production Database Migration Guide

## Problem
Production veritabanında Prisma schema değişiklikleri uygulanmadığında validation hataları oluşur. Özellikle opsiyonel alanlar (`String?`) database'de hala `NOT NULL` constraint'leri olabilir.

## Çözüm Yöntemleri

### Yöntem 1: Vercel CLI ile Manuel Migration (Önerilen)

1. **Vercel CLI'yi yükleyin:**
   ```bash
   npm i -g vercel
   ```

2. **Vercel'e login olun:**
   ```bash
   vercel login
   ```

3. **Projeyi link edin:**
   ```bash
   cd bgcassist
   vercel link
   ```

4. **Environment variable'ları kontrol edin:**
   ```bash
   vercel env ls
   ```
   `DATABASE_URL` değişkeninin production'da doğru olduğundan emin olun.

5. **Production database'ine bağlanın ve migration yapın:**
   ```bash
   # Production DATABASE_URL'i export edin
   export DATABASE_URL="your-production-database-url"
   
   # Prisma schema'yı database'e push edin
   npx prisma db push
   ```

### Yöntem 2: Supabase Dashboard Üzerinden

1. **Supabase Dashboard'a giriş yapın:**
   - https://supabase.com/dashboard

2. **Projenizi seçin**

3. **SQL Editor'ü açın**

4. **Aşağıdaki SQL komutlarını çalıştırın:**
   ```sql
   -- Application tablosundaki opsiyonel alanları güncelle
   ALTER TABLE "Application" 
     ALTER COLUMN "tcNo" DROP NOT NULL,
     ALTER COLUMN "email" DROP NOT NULL,
     ALTER COLUMN "city" DROP NOT NULL,
     ALTER COLUMN "district" DROP NOT NULL,
     ALTER COLUMN "plate" DROP NOT NULL,
     ALTER COLUMN "brand" DROP NOT NULL,
     ALTER COLUMN "model" DROP NOT NULL,
     ALTER COLUMN "year" DROP NOT NULL;
   ```

### Yöntem 3: Vercel Build Hook (Otomatik)

Vercel'de her build sonrası otomatik migration için:

1. **Vercel Dashboard'a giriş yapın**

2. **Project Settings > Environment Variables** bölümüne gidin

3. **Build Command'ı güncelleyin:**
   ```
   prisma generate && prisma db push && next build
   ```
   
   ⚠️ **DİKKAT:** Bu yöntem production'da riskli olabilir. Sadece development/staging için önerilir.

### Yöntem 4: Local'den Production'a Migration

1. **Local'de schema'yı kontrol edin:**
   ```bash
   cd bgcassist
   npx prisma db push --preview-feature
   ```

2. **Production DATABASE_URL'i .env.production'a ekleyin:**
   ```env
   DATABASE_URL="your-production-database-url"
   ```

3. **Production'a push edin:**
   ```bash
   DATABASE_URL="your-production-database-url" npx prisma db push
   ```

## Doğrulama

Migration sonrası doğrulama için:

1. **Prisma Studio ile kontrol edin:**
   ```bash
   DATABASE_URL="your-production-database-url" npx prisma studio
   ```

2. **Veya SQL ile kontrol edin:**
   ```sql
   SELECT column_name, is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'Application';
   ```

## Önemli Notlar

- ⚠️ **Production migration yapmadan önce mutlaka backup alın**
- ⚠️ **Migration sırasında database'e erişim kesilebilir**
- ✅ **Test environment'da önce deneyin**
- ✅ **Migration sonrası API endpoint'lerini test edin**

## Hata Durumunda

Eğer migration sırasında hata alırsanız:

1. **Hata mesajını kaydedin**
2. **Database backup'ı geri yükleyin**
3. **Schema'yı tekrar kontrol edin**
4. **Gerekirse Prisma support'a başvurun**

## İletişim

Sorun yaşarsanız:
- GitHub Issues: [proje-repo-url]
- Email: [support-email]
