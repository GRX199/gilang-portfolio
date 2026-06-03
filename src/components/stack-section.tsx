"use client";

import { useState } from "react";
import { trackPortfolioEvent } from "@/lib/analytics";
import type { StackCategory, StackItem } from "@/lib/content-types";
import { getIcon } from "@/lib/icon-map";

const filters = [
  { label: "All", value: "all" },
  { label: "Core", value: "core" },
  { label: "Language", value: "language" },
  { label: "Framework", value: "framework" },
  { label: "Tools", value: "tool" },
] as const;

export function StackSection({ stackItems }: { stackItems: StackItem[] }) {
  const [activeFilter, setActiveFilter] =
    useState<(typeof filters)[number]["value"]>("all");

  const visibleItems =
    activeFilter === "all"
      ? stackItems
      : stackItems.filter((item) => item.category === (activeFilter as StackCategory));

  return (
    <section className="section stack-section" id="stack" aria-label="Technology stack">
      <div className="container">
        <div className="stack-tabs" role="tablist" aria-label="Filter tech stack">
          {filters.map((filter) => (
            <button
              className={filter.value === activeFilter ? "active" : ""}
              key={filter.value}
              type="button"
              role="tab"
              aria-selected={filter.value === activeFilter}
              onClick={() => {
                setActiveFilter(filter.value);
                trackPortfolioEvent("Stack Filter", { filter: filter.value });
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="stack-grid" aria-live="polite">
          {visibleItems.map((item) => {
            const Icon = getIcon(item.icon);
            return (
              <div className="stack-card" key={item.name}>
                <span className="stack-icon" aria-hidden="true">
                  <Icon size={24} />
                </span>
                <span>{item.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
