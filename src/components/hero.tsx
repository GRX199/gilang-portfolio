"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, MapPin, Terminal } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { trackPortfolioEvent } from "@/lib/analytics";
import type { SiteContent } from "@/lib/content-types";
import { getIcon } from "@/lib/icon-map";

export function Hero({ content }: { content: SiteContent }) {
  const { quickLinks, siteConfig, statusMessages } = content;
  const [timeLabel, setTimeLabel] = useState("");
  const [statusIndex, setStatusIndex] = useState(0);
  const [tiltEnabled, setTiltEnabled] = useState(true);
  const shouldReduceMotion = useReducedMotion() ?? false;
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const springX = useSpring(x, { stiffness: 120, damping: 18 });
  const springY = useSpring(y, { stiffness: 120, damping: 18 });
  const rotateY = useTransform(springX, [0, 1], [-7, 7]);
  const rotateX = useTransform(springY, [0, 1], [6, -6]);

  const activeStatus = statusMessages[statusIndex % statusMessages.length] || siteConfig.location;
  const canTilt = tiltEnabled && !shouldReduceMotion;
  const tickerItems = [
    siteConfig.focus,
    siteConfig.availability,
    "Selected project work",
    "Clean web interfaces",
  ];

  useEffect(() => {
    const updateTime = () => {
      setTimeLabel(
        new Intl.DateTimeFormat("en-US", {
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
    const statusTimer = shouldReduceMotion
      ? undefined
      : window.setInterval(() => {
          setStatusIndex((current) => current + 1);
        }, 4_000);

    return () => {
      window.clearInterval(timeTimer);
      if (statusTimer !== undefined) {
        window.clearInterval(statusTimer);
      }
    };
  }, [shouldReduceMotion]);

  useEffect(() => {
    const syncTiltPreference = () => {
      setTiltEnabled(window.localStorage.getItem("enable3D") !== "false");
    };

    const handleTiltChange = (event: Event) => {
      const nextValue = (event as CustomEvent<boolean>).detail;
      setTiltEnabled(typeof nextValue === "boolean" ? nextValue : true);
    };

    const frame = window.requestAnimationFrame(syncTiltPreference);
    window.addEventListener("portfolio-tilt-change", handleTiltChange);
    window.addEventListener("storage", syncTiltPreference);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("portfolio-tilt-change", handleTiltChange);
      window.removeEventListener("storage", syncTiltPreference);
    };
  }, []);

  useEffect(() => {
    if (!canTilt) {
      x.set(0.5);
      y.set(0.5);
    }
  }, [canTilt, x, y]);

  return (
    <section
      className="hero-section"
      id="home"
      aria-labelledby="hero-title"
      onMouseMove={(event) => {
        if (!canTilt) return;
        const rect = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - rect.left) / rect.width);
        y.set((event.clientY - rect.top) / rect.height);
      }}
      onMouseLeave={() => {
        x.set(0.5);
        y.set(0.5);
      }}
    >
      <motion.div
        className="hero-tilt-stage"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: "easeOut" }}
        style={{
          rotateX: canTilt ? rotateX : 0,
          rotateY: canTilt ? rotateY : 0,
          transformStyle: "preserve-3d",
        }}
      >
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              {siteConfig.name} - {siteConfig.roles}
            </p>
            <h1 id="hero-title">{siteConfig.headline}</h1>
            <p className="lead">{siteConfig.bio}</p>

            <Signature />

            <p className="follow-line">- Follow along on the internet.</p>

            <div className="status-list" aria-label="Personal status">
              <div className="status-item">
                <MapPin size={15} aria-hidden="true" />
                <TextReveal text={activeStatus} delay={0.65} instant={shouldReduceMotion} />
              </div>
              <div className="status-item">
                <Terminal size={15} aria-hidden="true" />
                <TextReveal
                  text={timeLabel || "Loading time..."}
                  delay={0.82}
                  instant={shouldReduceMotion}
                />
              </div>
              {quickLinks.map((link, index) => {
                const Icon = getIcon(link.icon);
                return (
                  <Link
                    className="status-item status-link"
                    href={link.href}
                    key={link.href}
                    onClick={() => trackPortfolioEvent("Hero Quick Link", { label: link.label })}
                  >
                    <Icon size={15} aria-hidden="true" />
                    <TextReveal
                      text={link.label}
                      delay={0.98 + index * 0.12}
                      instant={shouldReduceMotion}
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          <KineticPanel content={content} />
        </div>

        <div className="hero-ticker" aria-hidden="true">
          <div>
            {[...tickerItems, ...tickerItems].map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function TextReveal({
  delay = 0,
  instant = false,
  text,
}: {
  delay?: number;
  instant?: boolean;
  text: string;
}) {
  const [displayText, setDisplayText] = useState(() => createTextPlaceholder(text));

  useEffect(() => {
    if (instant) {
      return;
    }

    let revealTimer: number | undefined;
    const resetTimer = window.setTimeout(() => {
      setDisplayText(createTextPlaceholder(text));
    }, 0);
    const startTimer = window.setTimeout(() => {
      let progress = 0;

      if (!text) {
        setDisplayText("");
        return;
      }

      revealTimer = window.setInterval(() => {
        progress += 0.7;

        if (progress >= text.length) {
          window.clearInterval(revealTimer);
          setDisplayText(text);
          return;
        }

        setDisplayText(revealText(text, progress));
      }, 28);
    }, delay * 1000);

    return () => {
      window.clearTimeout(resetTimer);
      window.clearTimeout(startTimer);

      if (revealTimer !== undefined) {
        window.clearInterval(revealTimer);
      }
    };
  }, [delay, instant, text]);

  return (
    <span className="text-reveal" aria-label={text}>
      <span aria-hidden="true">{instant ? text : displayText}</span>
    </span>
  );
}

function createTextPlaceholder(text: string) {
  return text.replace(/\S/g, "X");
}

function revealText(text: string, progress: number) {
  return text
    .split("")
    .map((character, index) => {
      if (character === " ") return " ";
      if (index < progress) return character;

      return Math.random() > 0.5 ? "X" : "/";
    })
    .join("");
}

function KineticPanel({ content }: { content: SiteContent }) {
  const { projects, siteConfig, stackItems } = content;
  const shouldReduceMotion = useReducedMotion() ?? false;
  const featuredCount = projects.filter((project) => project.featured).length;
  const categoryCount = new Set(stackItems.map((item) => item.category)).size;
  const featuredProject = projects.find((project) => project.featured) || projects[0];
  const shortAvailability = siteConfig.availability.split(".")[0] || siteConfig.availability;
  const metrics = [
    {
      href: "/portfolio",
      label: "Project",
      value: String(projects.length),
      detail: `${featuredCount} featured`,
    },
    {
      href: "/stack",
      label: "Stack",
      value: String(stackItems.length),
      detail: `${categoryCount} categories`,
    },
    {
      href: "/collaborate",
      label: "Contact",
      value: "Open",
      detail: shortAvailability,
    },
    {
      href: "/portfolio",
      label: "Featured",
      value: String(featuredCount),
      detail: "top projects",
    },
  ];
  const activityRows = [
    ["focus", siteConfig.focus],
    ["location", siteConfig.location],
    ["featured", featuredProject?.title || "Portfolio is ready"],
  ];
  const rows = [
    ["profile", siteConfig.handle],
    ["focus", siteConfig.focus],
    ["stack", "next.js, tailwind, motion"],
    ["status", siteConfig.availability],
  ];

  return (
    <motion.aside
      className="hero-console motion-console"
      aria-label="Portfolio summary"
      initial={shouldReduceMotion ? false : { opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.55,
        delay: shouldReduceMotion ? 0 : 0.15,
        ease: "easeOut",
      }}
    >
      <div className="console-top">
        <span />
        <span />
        <span />
      </div>

      <div className="signal-board">
        <div className="signal-board-head">
          <div className="signal-board-title">
            <span>Portfolio snapshot</span>
            <strong>{siteConfig.handle}</strong>
          </div>
          <Link
            className="signal-board-action"
            href="/portfolio"
            onClick={() => trackPortfolioEvent("Console Route Opened", { label: "Work" })}
          >
            <ArrowUpRight size={14} aria-hidden="true" />
            Work
          </Link>
        </div>

        <div className="signal-metrics" aria-label="Website metrics">
          {metrics.map((metric) => (
            <Link
              className="signal-metric"
              href={metric.href}
              key={metric.label}
              onClick={() =>
                trackPortfolioEvent("Console Metric Opened", { label: metric.label })
              }
            >
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.detail}</small>
            </Link>
          ))}
        </div>

        <div className="signal-activity" aria-label="Active summary">
          {activityRows.map(([label, value]) => (
            <div className="signal-activity-item" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        <div className="signal-scan" />
      </div>

      <div className="console-lines">
        {rows.map(([label, value]) => (
          <p key={label}>
            <span>{label}</span> {value}
          </p>
        ))}
      </div>
    </motion.aside>
  );
}

function Signature() {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <svg
      className="signature"
      viewBox="0 0 300 116"
      aria-hidden="true"
      focusable="false"
    >
      <motion.text
        x="18"
        y="64"
        fill="currentColor"
        fontFamily='"Segoe Script", "Brush Script MT", "Lucida Handwriting", cursive'
        fontSize="58"
        fontWeight="400"
        letterSpacing="0"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.65,
          delay: shouldReduceMotion ? 0 : 0.25,
          ease: "easeOut",
        }}
      >
        Gilang
      </motion.text>
      <motion.path
        d="M19 80c39 18 91 17 132 4 35-12 75-22 126-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={shouldReduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 1.1,
          delay: shouldReduceMotion ? 0 : 0.65,
          ease: "easeInOut",
        }}
      />
      <motion.path
        d="M242 76c19 7 33 4 42-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        initial={shouldReduceMotion ? false : { opacity: 0, pathLength: 0 }}
        animate={{ opacity: 0.72, pathLength: 1 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.65,
          delay: shouldReduceMotion ? 0 : 1.1,
          ease: "easeOut",
        }}
      />
    </svg>
  );
}
