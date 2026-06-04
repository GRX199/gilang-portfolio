"use client";

import { Maximize2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useState } from "react";
import type { ProjectScreenshot } from "@/lib/content-types";

type ProjectScreenshotGalleryProps = {
  projectTitle: string;
  screenshots: ProjectScreenshot[];
};

export function ProjectScreenshotGallery({
  projectTitle,
  screenshots,
}: ProjectScreenshotGalleryProps) {
  const [activeScreenshot, setActiveScreenshot] = useState<ProjectScreenshot | null>(null);
  const [modalOrientation, setModalOrientation] = useState<"landscape" | "portrait">("landscape");
  const titleId = useId();

  useEffect(() => {
    if (!activeScreenshot) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveScreenshot(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeScreenshot]);

  const openScreenshot = (screenshot: ProjectScreenshot) => {
    setModalOrientation("landscape");
    setActiveScreenshot(screenshot);
  };

  return (
    <>
      <div className="project-screenshot-grid">
        {screenshots.map((screenshot, index) => (
          <button
            className={index === 0 ? "project-screenshot primary" : "project-screenshot"}
            key={`${screenshot.title}-${index}`}
            type="button"
            aria-label={`View ${projectTitle} ${screenshot.title} screenshot`}
            onClick={() => openScreenshot(screenshot)}
          >
            <Image
              src={screenshot.image}
              alt={`${projectTitle} - ${screenshot.title}`}
              width={960}
              height={600}
              sizes={
                index === 0 ? "(max-width: 920px) 100vw, 68vw" : "(max-width: 920px) 100vw, 32vw"
              }
              loading="lazy"
              decoding="async"
            />
            <span className="project-screenshot-caption">
              <span>
                <strong>{screenshot.title}</strong>
                <span>{screenshot.caption}</span>
              </span>
              <span className="project-screenshot-open">
                <Maximize2 size={14} strokeWidth={2} aria-hidden="true" />
                View image
              </span>
            </span>
          </button>
        ))}
      </div>

      {activeScreenshot ? (
        <div
          className={`project-screenshot-modal ${modalOrientation}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <button
            className="project-screenshot-modal-backdrop"
            type="button"
            aria-label="Close image preview"
            onClick={() => setActiveScreenshot(null)}
          />
          <div className="project-screenshot-modal-shell">
            <div className="project-screenshot-modal-head">
              <div>
                <p className="eyebrow">Preview</p>
                <h2 id={titleId}>{activeScreenshot.title}</h2>
              </div>
              <button
                className="project-screenshot-modal-close"
                type="button"
                aria-label="Close image preview"
                onClick={() => setActiveScreenshot(null)}
              >
                <X size={18} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
            <div className="project-screenshot-modal-image">
              <Image
                src={activeScreenshot.image}
                alt={`${projectTitle} - ${activeScreenshot.title}`}
                width={1440}
                height={900}
                sizes="100vw"
                priority
                unoptimized
                onLoad={(event) => {
                  const image = event.currentTarget;
                  setModalOrientation(
                    image.naturalHeight > image.naturalWidth ? "portrait" : "landscape",
                  );
                }}
              />
            </div>
            <p>{activeScreenshot.caption}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
