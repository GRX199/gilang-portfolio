# Gilang Portfolio

Website personal berbasis Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, Lucide React, Vercel Analytics, dan Sanity CMS.

## Jalankan

```bash
npm install
npm run dev
```

Local URL:

```text
http://localhost:3000
```

## Edit Konten

Ada dua cara:

1. Production CMS: buka `/studio` setelah Sanity env dikonfigurasi.
2. Development cepat: buka `/admin` saat `npm run dev`, edit konten, lalu klik **Simpan konten**.
3. Fallback manual: edit file `src/content/site-content.json`.

- Ganti nama, role, lokasi, dan email.
- Ganti daftar project.
- Ganti tech stack.
- Update `siteUrl` sebelum deploy agar sitemap dan metadata benar.

Saat production, editor file lokal dimatikan. Konten production disimpan di Sanity agar persist setelah deploy.

## Deploy

Project ini sudah siap deploy ke Vercel.

Vercel settings:

```text
Framework Preset: Next.js
Root Directory: gilang-portfolio
Install Command: npm install
Build Command: npm run build
```

Environment variables:

```text
NEXT_PUBLIC_SITE_URL=https://domain-kamu.com
NEXT_PUBLIC_SANITY_PROJECT_ID=isi_project_id_sanity
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-05-20
```

Kalau Sanity env belum diisi, website tetap build memakai fallback JSON lokal. Setelah Sanity siap, buka `/studio` untuk mengelola konten.

## Seed Sanity

Untuk mengirim konten awal dari `src/content/site-content.json` ke Sanity:

```bash
Copy-Item .env.example .env.local
```

Isi `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, dan `SANITY_API_WRITE_TOKEN`, lalu jalankan:

```bash
npm run sanity:seed
```

Tambahkan CORS origin di dashboard Sanity untuk:

```text
http://localhost:3000
https://domain-kamu.com
```

## Verifikasi

```bash
npm run deploy:check
npm audit --omit=dev
```
