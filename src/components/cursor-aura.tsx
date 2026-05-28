"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export function CursorAura() {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const rawX = useMotionValue(-120);
  const rawY = useMotionValue(-120);
  const x = useSpring(rawX, { stiffness: 420, damping: 34, mass: 0.5 });
  const y = useSpring(rawY, { stiffness: 420, damping: 34, mass: 0.5 });

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncEnabled = () => setEnabled(finePointer.matches && !reduceMotion.matches);

    syncEnabled();
    finePointer.addEventListener("change", syncEnabled);
    reduceMotion.addEventListener("change", syncEnabled);

    return () => {
      finePointer.removeEventListener("change", syncEnabled);
      reduceMotion.removeEventListener("change", syncEnabled);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handlePointerMove = (event: PointerEvent) => {
      rawX.set(event.clientX);
      rawY.set(event.clientY);
      setActive(true);
    };

    const handlePointerOver = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      setInteractive(Boolean(target?.closest("a, button, input, select, textarea, [role='button']")));
    };

    const handlePointerLeave = () => {
      setActive(false);
      setInteractive(false);
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerover", handlePointerOver);
    document.documentElement.addEventListener("mouseleave", handlePointerLeave);

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerover", handlePointerOver);
      document.documentElement.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, [enabled, rawX, rawY]);

  if (!enabled) return null;

  return (
    <motion.div
      className={[
        "cursor-aura",
        active ? "active" : "",
        interactive ? "interactive" : "",
      ].join(" ")}
      style={{ left: x, top: y }}
      aria-hidden="true"
    >
      <span className="cursor-aura-ring" />
      <span className="cursor-aura-dot" />
    </motion.div>
  );
}
