"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ToastProps {
  message: string;
  type?: "error" | "success" | "info";
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = "error", onClose, duration = 4000 }: ToastProps) {
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setIsClosing(true);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => {
        onClose();
      }, 300); // tempo correspondente à duração da animação de saída (0.3s)
      return () => clearTimeout(timer);
    }
  }, [isClosing, onClose]);

  const getColors = () => {
    switch (type) {
      case "success":
        return {
          bg: "rgba(16, 185, 129, 0.12)",
          border: "rgba(16, 185, 129, 0.3)",
          glow: "rgba(16, 185, 129, 0.15)",
          iconColor: "#34d399",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="18" height="18" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )
        };
      case "info":
        return {
          bg: "rgba(86, 153, 219, 0.12)",
          border: "rgba(86, 153, 219, 0.3)",
          glow: "rgba(86, 153, 219, 0.15)",
          iconColor: "#5699db",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          )
        };
      case "error":
      default:
        return {
          bg: "rgba(239, 68, 68, 0.12)",
          border: "rgba(239, 68, 68, 0.3)",
          glow: "rgba(239, 68, 68, 0.15)",
          iconColor: "#f87171",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )
        };
    }
  };

  const colors = getColors();

  if (!mounted) return null;

  return createPortal(
    <div
      className={`custom-toast ${isClosing ? "closing" : ""}`}
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        boxShadow: `0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px ${colors.glow}`,
      }}
    >
      <style>{`
        .custom-toast {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: #121520;
          border-radius: 12px;
          color: #ffffff;
          font-family: var(--font-sora);
          font-size: 14px;
          font-weight: 600;
          min-width: 300px;
          max-width: 400px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .custom-toast.closing {
          animation: slideOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideIn {
          from {
            transform: translateX(120%) translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0) translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideOut {
          from {
            transform: translateX(0) translateY(0);
            opacity: 1;
          }
          to {
            transform: translateX(120%) translateY(-20px);
            opacity: 0;
          }
        }

        @media (max-width: 576px) {
          .custom-toast {
            top: 16px;
            right: 16px;
            left: 16px;
            min-width: 0;
            max-width: none;
            width: auto;
            animation: slideInMobile 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .custom-toast.closing {
            animation: slideOutMobile 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        }

        @keyframes slideInMobile {
          from {
            transform: translateY(-50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideOutMobile {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(-50px);
            opacity: 0;
          }
        }
      `}</style>
      <div style={{ color: colors.iconColor, display: "flex", flexShrink: 0 }}>
        {colors.icon}
      </div>
      <div style={{ flexGrow: 1, lineHeight: "1.4" }}>{message}</div>
      <button
        onClick={() => setIsClosing(true)}
        style={{
          background: "transparent",
          border: "none",
          color: "rgba(255, 255, 255, 0.4)",
          cursor: "pointer",
          fontSize: "18px",
          padding: "0 4px",
          display: "flex",
          alignItems: "center",
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.4)")}
      >
        &times;
      </button>
    </div>,
    document.body
  );
}
