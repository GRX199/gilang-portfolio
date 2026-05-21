import type { Metadata } from "next";
import { SanityStudio } from "@/components/sanity-studio";
import { isSanityConfigured } from "@/sanity/env";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Studio",
  description: "Private content studio for this portfolio.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main className="studio-empty">
        <div>
          <p className="eyebrow">Sanity Studio</p>
          <h1>Studio is not configured.</h1>
          <p>
            Add `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`
            to `.env.local` or Vercel environment variables, then redeploy.
          </p>
        </div>
      </main>
    );
  }

  return <SanityStudio />;
}
