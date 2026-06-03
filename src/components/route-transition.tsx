"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

export function RouteTransition() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion() ?? false;

  if (shouldReduceMotion) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="route-transition"
        key={pathname}
        initial={{ opacity: 1, scaleX: 0 }}
        animate={{ opacity: [1, 1, 0], scaleX: [0, 1, 0] }}
        transition={{ duration: 0.72, ease: "easeInOut", times: [0, 0.46, 1] }}
        aria-hidden="true"
      >
        <span />
      </motion.div>
    </AnimatePresence>
  );
}
