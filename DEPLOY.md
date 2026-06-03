# Deploy Guide

## 1. Vercel

Import repository ke Vercel, lalu gunakan konfigurasi berikut:

```text
Framework Preset: Next.js
Root Directory: gilang-portfolio
Install Command: npm install
Build Command: npm run build
```

## 2. Environment

Isi environment variable berikut di Vercel:

```text
NEXT_PUBLIC_SITE_URL=https://domain-kamu.com
NEXT_PUBLIC_SANITY_PROJECT_ID=isi_project_id_sanity
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-05-20
```

`SANITY_API_WRITE_TOKEN` hanya diperlukan di lokal kalau ingin menjalankan `npm run sanity:seed`.

## 3. Sanity

1. Buat project di Sanity.
2. Salin Project ID ke `NEXT_PUBLIC_SANITY_PROJECT_ID`.
3. Tambahkan CORS origin di Sanity untuk `http://localhost:3000` dan domain Vercel kamu.
4. Jalankan `npm run sanity:seed` untuk mengirim konten awal.
5. Deploy ke Vercel.
6. Buka `/studio` untuk mengedit konten.

## 4. Routes

```text
/             Homepage
/portfolio    Semua project
/stack        Tech stack
/collaborate  Kontak
/studio       Sanity Studio
```

## 5. Project Screenshots

Untuk project website yang sudah hosting, isi `Live Website URL` di CMS lalu jalankan:

```bash
npm run capture:screenshots
```

Script ini membuat PNG ke `public/projects/captures` dan memperbarui `src/content/project-screenshot-manifest.json`. Commit hasilnya sebelum push agar Vercel memakai preview terbaru. Script ini sengaja tidak dijalankan otomatis di Vercel supaya build tetap ringan.

GitHub Actions `Capture Project Screenshots` akan menjalankan capture otomatis tiap 6 jam untuk repo GitHub baru yang punya Website/Homepage URL. Kalau ada screenshot baru, workflow commit hasilnya dan Vercel redeploy otomatis.

## 6. Final Check

```bash
npm run deploy:check
npm audit --omit=dev
```
