"use client";

import React, { useState } from "react";
import { Language, translations } from "@/lib/translations";

interface SupportWidgetProps {
  lang: Language;
}

export default function SupportWidget({ lang }: SupportWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = translations[lang];

  return (
    <div className="support-widget">
      {isOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            right: "0",
            width: "270px",
            background: "#ffffff",
            color: "#191c26",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            border: "1px solid #cbd5e1",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "var(--primary-blue)",
              color: "#181c2b",
              padding: "16px",
              fontWeight: "700",
              fontSize: "17px",
              fontFamily: "var(--font-sora)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{t.support.title}</span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#181c2b",
                fontSize: "20px",
                fontWeight: "700",
                cursor: "pointer",
                padding: "0 4px",
              }}
            >
              &times;
            </button>
          </div>
          <div
            style={{
              padding: "20px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                fontFamily: "var(--font-sora)",
                color: "#555555",
                margin: "0",
                lineHeight: "1.5",
              }}
            >
              {t.support.instruction}
            </p>
            <a
              href={`mailto:${t.support.email}`}
              style={{
                fontSize: "14px",
                fontWeight: "700",
                fontFamily: "var(--font-primary)",
                color: "#0c2144",
                textDecoration: "underline",
                wordBreak: "break-all",
              }}
            >
              {t.support.email}
            </a>
            <a
              href={`mailto:${t.support.email}`}
              onClick={() => setIsOpen(false)}
              style={{
                background: "var(--primary-blue)",
                color: "#181c2b",
                textDecoration: "none",
                borderRadius: "6px",
                padding: "10px 16px",
                fontSize: "14px",
                fontWeight: "700",
                fontFamily: "var(--font-sora)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: "100%",
                transition: "opacity 0.2s",
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              {t.support.btnEmail}
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="support-btn"
        style={{
          background: "var(--primary-blue)",
          color: "#181c2b",
          fontFamily: "var(--font-sora)",
        }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
        <span className="support-btn-text">{t.support.title}</span>
      </button>
    </div>
  );
}
