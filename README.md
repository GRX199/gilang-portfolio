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

1. CMS: buka `/studio` setelah Sanity env dikonfigurasi.
2. Fallback manual: edit file `src/content/site-content.json`.

- Ganti nama, role, lokasi, dan email.
- Ganti status, quick links, tech stack, dan social links.
- Update `siteUrl` sebelum deploy agar sitemap dan metadata benar.

Halaman Project menggabungkan project dari CMS dan repository publik dari GitHub. Project CMS tampil lebih dulu, lalu repository GitHub ditambahkan otomatis. Untuk mengubah repo yang tampil, edit nama repository, description, topics, language, atau visibility di GitHub.

## Screenshot Project Otomatis

Project website yang sudah live bisa memakai screenshot langsung dari halaman deploy.

Di CMS, isi field berikut pada project:

- `Live Website URL`: URL project yang sudah hosting, misalnya `https://project-kamu.vercel.app`.
- `Use Auto Screenshot`: aktifkan kalau screenshot generated boleh mengganti gambar manual.
- `Auto Screenshot Paths`: opsional, isi path seperti `/`, `/dashboard`, `/contact` untuk visual checkpoints.

Lalu jalankan:

```bash
npm run capture:screenshots
```

Hasilnya disimpan ke:

```text
public/projects/captures
src/content/project-screenshot-manifest.json
```

Commit dan push file hasil capture tersebut agar Vercel menampilkan gambar terbaru saat deploy. Kalau screenshot belum ada atau URL gagal dicapture, website tetap memakai gambar manual dari CMS atau fallback bawaan.

Repo ini juga punya GitHub Actions otomatis:

- Berjalan tiap 6 jam.
- Mencari repo GitHub public yang punya field Website/Homepage.
- Capture hanya project yang belum punya screenshot di manifest.
- Commit hasil screenshot otomatis, lalu Vercel akan redeploy dari commit itu.

Untuk menjalankan otomatisnya saat itu juga, buka tab GitHub **Actions** lalu pilih **Capture Project Screenshots** dan klik **Run workflow**.

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

Setelah Sanity siap, buka:

```text
http://localhost:3000/studio
https://domain-kamu.com/studio
```

## Verifikasi

```bash
npm run deploy:check
npm audit --omit=dev
```
