import type { Metadata } from "next";
import { SanityStudio } from "@/components/sanity-studio";
import { isSanityConfigured } from "@/sanity/env";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Studio",
  description: "Sanity Studio untuk mengelola konten portfolio.",
};

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main className="studio-empty">
        <div>
          <p className="eyebrow">Sanity Studio</p>
          <h1>CMS belum dikonfigurasi.</h1>
          <p>
            Isi `NEXT_PUBLIC_SANITY_PROJECT_ID` dan `NEXT_PUBLIC_SANITY_DATASET`
            di environment Vercel atau file `.env.local`, lalu jalankan ulang app.
          </p>
        </div>
      </main>
    );
  }

  return <SanityStudio />;
}
