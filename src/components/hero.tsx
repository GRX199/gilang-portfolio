"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { MapPin, Terminal } from "lucide-react";
import { useEffect, useState } from "react";
import type { SiteContent } from "@/lib/content-types";
import { getIcon } from "@/lib/icon-map";

export function Hero({ content }: { content: SiteContent }) {
  const { quickLinks, siteConfig, statusMessages } = content;
  const [timeLabel, setTimeLabel] = useState("");
  const [statusIndex, setStatusIndex] = useState(0);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const springX = useSpring(x, { stiffness: 120, damping: 18 });
  const springY = useSpring(y, { stiffness: 120, damping: 18 });
  const rotateY = useTransform(springX, [0, 1], [-7, 7]);
  const rotateX = useTransform(springY, [0, 1], [6, -6]);

  const activeStatus = statusMessages[statusIndex % statusMessages.length] || siteConfig.location;

  useEffect(() => {
    const updateTime = () => {
      setTimeLabel(
        new Intl.DateTimeFormat("id-ID", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Makassar",
        })
          .format(new Date())
          .toUpperCase(),
      );
    };

    updateTime();
    const timeTimer = window.setInterval(updateTime, 30_000);
    const statusTimer = window.setInterval(() => {
      setStatusIndex((current) => current + 1);
    }, 4_000);

    return () => {
      window.clearInterval(timeTimer);
      window.clearInterval(statusTimer);
    };
  }, []);

  return (
    <section
      className="hero-section"
      id="home"
      aria-labelledby="hero-title"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - rect.left) / rect.width);
        y.set((event.clientY - rect.top) / rect.height);
      }}
      onMouseLeave={() => {
        x.set(0.5);
        y.set(0.5);
      }}
    >
      <div className="container hero-grid">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        >
          <p className="eyebrow">
            {siteConfig.name} - {siteConfig.roles}
          </p>
          <h1 id="hero-title">{siteConfig.headline}</h1>
          <p className="lead">{siteConfig.bio}</p>

          <div className="hero-actions" aria-label="Tautan utama">
            <a href="/portfolio">Lihat project</a>
            <a href="/collaborate">Mulai ngobrol</a>
          </div>

          <Signature />

          <div className="status-list" aria-label="Status personal">
            <div className="status-item">
              <MapPin size={15} aria-hidden="true" />
              <span>{activeStatus}</span>
            </div>
            <div className="status-item">
              <Terminal size={15} aria-hidden="true" />
              <span>{timeLabel || "Mengambil waktu..."}</span>
            </div>
            {quickLinks.map((link) => {
              const Icon = getIcon(link.icon);
              return (
                <a className="status-item status-link" href={link.href} key={link.href}>
                  <Icon size={15} aria-hidden="true" />
                  <span>{link.label}</span>
                </a>
              );
            })}
          </div>
        </motion.div>

        <motion.aside
          className="hero-console"
          aria-label="Ringkasan build"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
        >
          <div className="console-top">
            <span />
            <span />
            <span />
          </div>
          <div className="console-lines">
            <p>
              <span>profile</span> {siteConfig.handle}
            </p>
            <p>
              <span>focus</span> {siteConfig.focus}
            </p>
            <p>
              <span>stack</span> next.js, tailwind, motion
            </p>
            <p>
              <span>status</span> {siteConfig.availability}
            </p>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}

function Signature() {
  return (
    <svg
      className="signature"
      viewBox="0 0 220 100"
      aria-hidden="true"
      focusable="false"
    >
      <motion.path
        d="M18 68c19-40 46-58 56-44 9 14-19 54-36 53-12-1-7-22 21-38 27-15 50-9 45 8-5 18-42 18-31 0 11-18 51-10 93 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
      />
    </svg>
  );
}
