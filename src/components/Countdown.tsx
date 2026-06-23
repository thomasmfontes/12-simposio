"use client";

import React, { useEffect, useState } from "react";
import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import "@leenguyen/react-flip-clock-countdown/dist/index.css";

import { Language, translations } from "@/lib/translations";

interface CountdownProps {
  lang: Language;
}

export default function Countdown({ lang }: CountdownProps) {
  const targetDate = new Date("2026-09-02T13:00:00").getTime();
  const [mounted, setMounted] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="countdown-container" style={{ minHeight: "120px" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>
          {t.countdown.loading}
        </p>
      </div>
    );
  }

  return (
    <div
      className="countdown-container"
      style={{ display: "flex", justifyContent: "center" }}
    >
      <FlipClockCountdown
        to={targetDate}
        labels={t.countdown.labels as [string, string, string, string]}
        labelStyle={{
          fontSize: "var(--countdown-label-fs, 16px)",
          fontWeight: 700,
          color: "var(--primary-blue)",
          fontFamily: "var(--font-sora)",
          marginTop: 12,
        }}
        digitBlockStyle={{
          width: "var(--countdown-digit-w, 48px)",
          height: "var(--countdown-digit-h, 64px)",
          fontSize: "var(--countdown-digit-fs, 44px)",
          fontWeight: 600,
          fontFamily: "var(--font-display)",
          color: "var(--text-white)",
          background: "#18181b",
          boxShadow: "0 0 12px rgba(255, 255, 255, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 4,
        }}
        dividerStyle={{ color: "rgba(0, 0, 0, 0.5)", height: 1 }}
        separatorStyle={{ color: "transparent", size: "var(--countdown-separator-size, 28px)" }}
        duration={0.5}
      />
    </div>
  );
}
