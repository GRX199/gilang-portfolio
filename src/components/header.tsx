"use client";

import { Layers, Lightbulb } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { trackPortfolioEvent } from "@/lib/analytics";
import type { SiteConfig } from "@/lib/content-types";

export function Header({ siteConfig }: { siteConfig: SiteConfig }) {
  const [vibeMode, setVibeMode] = useState(false);
  const [tiltEnabled, setTiltEnabled] = useState(true);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const pathname = usePathname();
  const navItems = [
    { href: "/portfolio", label: "Projects" },
    { href: "/stack", label: "Stack" },
    { href: "/collaborate", label: "Contact" },
  ];

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const storedVibe = window.localStorage.getItem("vibeMode");
      const storedTilt = window.localStorage.getItem("enable3D");

      if (storedVibe !== null) {
        setVibeMode(storedVibe === "true");
      }

      if (storedTilt !== null) {
        setTiltEnabled(storedTilt === "true");
      }

      setPreferencesReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!preferencesReady) return;
    document.documentElement.dataset.vibe = vibeMode ? "on" : "off";
    window.localStorage.setItem("vibeMode", String(vibeMode));
  }, [preferencesReady, vibeMode]);

  useEffect(() => {
    if (!preferencesReady) return;
    document.documentElement.dataset.tilt = tiltEnabled ? "on" : "off";
    window.localStorage.setItem("enable3D", String(tiltEnabled));
    window.dispatchEvent(
      new CustomEvent("portfolio-tilt-change", {
        detail: tiltEnabled,
      }),
    );
  }, [preferencesReady, tiltEnabled]);

  return (
    <header className="site-header" aria-label="Main navigation">
      <Link className="brand-mark" href="/" aria-label="Back to home">
        <span aria-hidden="true">{siteConfig.name.slice(0, 1)}</span>
      </Link>

      <nav className="nav-pills" aria-label="Site sections">
        {navItems.map((item) => (
          <Link
            href={item.href}
            key={item.href}
            aria-current={
              pathname === item.href || pathname.startsWith(`${item.href}/`) ? "page" : undefined
            }
            onClick={() => trackPortfolioEvent("Navigation Click", { label: item.label })}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="header-actions">
        <button
          className={tiltEnabled ? "round-button active" : "round-button"}
          type="button"
          aria-label={tiltEnabled ? "Disable 3D tilt" : "Enable 3D tilt"}
          aria-pressed={tiltEnabled}
          title={tiltEnabled ? "Disable 3D tilt" : "Enable 3D tilt"}
          onClick={() =>
            setTiltEnabled((current) => {
              const nextValue = !current;
              trackPortfolioEvent("Toggle 3D Tilt", { enabled: nextValue });
              return nextValue;
            })
          }
        >
          <Layers size={17} strokeWidth={2} aria-hidden="true" />
        </button>

        <button
          className={vibeMode ? "round-button active" : "round-button"}
          type="button"
          aria-label="Toggle accent mode"
          aria-pressed={vibeMode}
          title="Toggle accent mode"
          onClick={() =>
            setVibeMode((current) => {
              const nextValue = !current;
              trackPortfolioEvent("Toggle Accent Mode", { enabled: nextValue });
              return nextValue;
            })
          }
        >
          <Lightbulb size={17} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
