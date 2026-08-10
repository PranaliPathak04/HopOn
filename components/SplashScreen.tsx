"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

const CAR_DURATION = 2.0; // seconds, car crossing the screen
const HOLD_AFTER = 0.6; // seconds to hold once car+text have landed

export default function SplashScreen({
  children,
}: {
  children: React.ReactNode;
}) {
  // null = "not decided yet" (avoids a server/client flash)
  const [visible, setVisible] = useState<boolean | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setReducedMotion(prefersReduced);

    setVisible(true);

    const totalMs = prefersReduced ? 500 : (CAR_DURATION + HOLD_AFTER) * 1000;

    const timer = setTimeout(() => setVisible(false), totalMs);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
            style={{ background: "var(--color-paper)" }}
          >
            {/* faint road the car travels on */}
            <div
              className="absolute left-0 right-0"
              style={{
                bottom: "calc(50% - 34px)",
                height: 2,
                background:
                  "repeating-linear-gradient(90deg, var(--color-go) 0 24px, transparent 24px 48px)",
                opacity: 0.35,
              }}
            />

            {/* car — slides fully across, left to right */}
            <motion.div
              initial={{ x: "-20vw" }}
              animate={reducedMotion ? { x: "0vw" } : { x: "120vw" }}
              transition={{
                duration: reducedMotion ? 0 : CAR_DURATION,
                ease: [0.65, 0, 0.35, 1],
              }}
              className="absolute"
              style={{ bottom: "calc(50% - 16px)" }}
            >
              <Image
                src="/hopon-car.svg"
                alt=""
                width={72}
                height={64}
                priority
              />
            </motion.div>

            {/* wordmark — sits ABOVE the road line, appears once the car has mostly passed */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: reducedMotion ? 0.1 : CAR_DURATION * 0.55,
                duration: 0.5,
                ease: "easeOut",
              }}
              className="absolute text-center"
              style={{ bottom: "calc(50% + 30px)" }}
            >
              <h1
                className="font-display text-4xl font-extrabold tracking-tight"
                style={{ color: "var(--color-ink)" }}
              >
                Hop<span style={{ color: "var(--color-go)" }}>On</span>
              </h1>
              <p
                className="mt-1.5 text-sm"
                style={{ color: "var(--color-ink-muted)" }}
              >
                Share the ride, split the way
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </>
  );
}
