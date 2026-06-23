"use client";

import React, { useState } from "react";
import { Language, translations } from "@/lib/translations";

interface SupportWidgetProps {
  lang: Language;
}

export default function SupportWidget({ lang }: SupportWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const t = translations[lang];

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    const phone = "5511999999999"; // Telefone de suporte padrão (pode ser configurado)
    const text = encodeURIComponent(
      message || t.support.waText,
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
    setMessage("");
    setIsOpen(false);
  };

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
          <form
            onSubmit={handleStartChat}
            style={{
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <p
              style={{
                fontSize: "12.5px",
                fontFamily: "var(--font-sora)",
                color: "#777777",
                margin: "0",
                lineHeight: "1.4",
              }}
            >
              {t.support.instruction}
            </p>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.support.placeholder}
              style={{
                width: "100%",
                height: "80px",
                padding: "10px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontSize: "13px",
                fontFamily: "var(--font-primary)",
                resize: "none",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                background: "var(--primary-blue)",
                color: "#181c2b",
                border: "none",
                borderRadius: "6px",
                padding: "12px",
                fontSize: "14px",
                fontWeight: "700",
                fontFamily: "var(--font-sora)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "background 0.2s",
              }}
            >
              {t.support.btnChat}
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="16"
                height="16"
              >
                <path
                  d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                  transform="rotate(-45 12 12)"
                />
              </svg>
            </button>
          </form>
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
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L1.5 22.5l5.8-.8C8.63 22.345 10.27 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
        </svg>
        {t.support.title}
      </button>
    </div>
  );
}
