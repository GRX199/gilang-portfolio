"use client";

import { Lightbulb } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { SiteConfig } from "@/lib/content-types";

export function Header({ siteConfig }: { siteConfig: SiteConfig }) {
  const [vibeMode, setVibeMode] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.vibe = vibeMode ? "on" : "off";
  }, [vibeMode]);

  return (
    <header className="site-header" aria-label="Navigasi utama">
      <Link className="brand-mark" href="/" aria-label="Kembali ke beranda">
        <span aria-hidden="true">{siteConfig.name.slice(0, 1)}</span>
      </Link>

      <nav className="nav-pills" aria-label="Bagian halaman">
        <Link href="/portfolio">Project</Link>
        <Link href="/stack">Stack</Link>
        <Link href="/collaborate">Kontak</Link>
        <Link href="/admin">CMS</Link>
      </nav>

      <button
        className="round-button"
        type="button"
        aria-label="Ganti mode aksen"
        aria-pressed={vibeMode}
        onClick={() => setVibeMode((current) => !current)}
      >
        <Lightbulb size={17} strokeWidth={2} aria-hidden="true" />
      </button>
    </header>
  );
}
