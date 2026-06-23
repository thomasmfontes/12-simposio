"use client";

import React, { useState } from "react";
import { Language, translations } from "@/lib/translations";

interface SupportWidgetProps {
  lang: Language;
}

export default function SupportWidget({ lang }: SupportWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const t = translations[lang];

  const handleSubmitSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus("error");
      setErrorMsg(t.support.validationError);
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
        // Fecha automaticamente após 3 segundos
        setTimeout(() => {
          setIsOpen(false);
          setStatus("idle");
        }, 3000);
      } else {
        setStatus("error");
        setErrorMsg(data.error || t.support.errorMsg);
      }
    } catch (err) {
      console.error("Erro ao enviar chamado de suporte:", err);
      setStatus("error");
      setErrorMsg(t.support.errorMsg);
    }
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#475569",
    marginBottom: "4px",
    display: "block",
    fontFamily: "var(--font-sora)",
    textAlign: "left",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    fontSize: "13px",
    fontFamily: "var(--font-primary)",
    outline: "none",
    background: "#ffffff",
    color: "#1e293b",
  };

  return (
    <div className="support-widget">
      {isOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            right: "0",
            width: "300px",
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
          {/* Cabeçalho */}
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

          {/* Conteúdo */}
          {status === "success" ? (
            <div
              style={{
                padding: "30px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "#22c55e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: "24px",
                  marginBottom: "8px",
                }}
              >
                ✓
              </div>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  fontFamily: "var(--font-sora)",
                  color: "#1e293b",
                  margin: "0",
                  lineHeight: "1.4",
                }}
              >
                {t.support.successMsg}
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmitSupport}
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
                  color: "#64748b",
                  margin: "0 0 4px 0",
                  lineHeight: "1.4",
                  textAlign: "left",
                }}
              >
                {t.support.instruction}
              </p>

              <div>
                <label style={labelStyle}>{t.support.nameLabel}</label>
                <input
                  type="text"
                  required
                  style={inputStyle}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.support.namePlaceholder}
                  disabled={status === "loading"}
                />
              </div>

              <div>
                <label style={labelStyle}>{t.support.emailLabel}</label>
                <input
                  type="email"
                  required
                  style={inputStyle}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.support.emailPlaceholder}
                  disabled={status === "loading"}
                />
              </div>

              <div>
                <label style={labelStyle}>{t.support.messageLabel}</label>
                <textarea
                  required
                  style={{
                    ...inputStyle,
                    height: "70px",
                    resize: "none",
                  }}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.support.messagePlaceholder}
                  disabled={status === "loading"}
                />
              </div>

              {status === "error" && (
                <p
                  style={{
                    color: "#ef4444",
                    fontSize: "12px",
                    margin: "0",
                    textAlign: "left",
                    fontFamily: "var(--font-sora)",
                  }}
                >
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                style={{
                  background: "var(--primary-blue)",
                  color: "#181c2b",
                  border: "none",
                  borderRadius: "6px",
                  padding: "12px",
                  fontSize: "14px",
                  fontWeight: "700",
                  fontFamily: "var(--font-sora)",
                  cursor: status === "loading" ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  opacity: status === "loading" ? 0.7 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {status === "loading" ? (
                  <span>...</span>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                    {t.support.btnSend}
                  </>
                )}
              </button>
            </form>
          )}
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
