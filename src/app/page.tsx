"use client";

import React, { useState } from "react";
import Countdown from "@/components/Countdown";
import SupportWidget from "@/components/SupportWidget";
import RegisterForm from "@/components/RegisterForm";
import { translations, Language } from "@/lib/translations";

interface SuccessData {
  nm_inscrito: string;
  ds_email: string;
  ds_modalidade: string;
}

export default function Home() {
  const [lang, setLang] = useState<Language>("pt");
  const t = translations[lang];
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [quickEmail, setQuickEmail] = useState("");

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Faz a página descer suavemente até a seção do formulário
    const formSection = document.getElementById("formulario-inscricao");
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth" });
      // Se houver um input de e-mail no formulário, podemos focar nele e preenchê-lo
      const mainEmailInput = document.getElementById(
        "email",
      ) as HTMLInputElement;
      if (mainEmailInput) {
        mainEmailInput.value = quickEmail;
        // Dispara evento de mudança para atualizar o estado do React no formulário
        const event = new Event("input", { bubbles: true });
        mainEmailInput.dispatchEvent(event);
        mainEmailInput.focus();
      }
    }
  };

  return (
    <>
      {/* 1. Figma Header / Navigation Bar */}
      <header className="header-nav">
        <div className="container header-container">
          <nav>
            <ul className="header-menu">
              <li>
                <a href="#inicio">{t.header.home}</a>
              </li>
              <li>
                <a href="#formulario-inscricao">{t.header.inscricao}</a>
              </li>
            </ul>
          </nav>

          <div className="header-actions">
            <a
              href="/admin"
              title={t.header.restrictedArea}
              style={{
                color: "#e2e8f0",
                display: "flex",
                alignItems: "center",
                transition: "color 0.2s",
                padding: "4px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary-blue)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#e2e8f0")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </a>
            <div className="language-selector-nav">
              <button
                className="flag-btn"
                title="Português"
                onClick={() => setLang("pt")}
                style={{ opacity: lang === "pt" ? 1 : 0.6, display: "flex", padding: 0 }}
              >
                <img
                  src="/design/flag_br.png"
                  alt="Português"
                  style={{ width: "24px", height: "auto" }}
                />
              </button>
              <button
                className="flag-btn"
                title="Español"
                onClick={() => setLang("es")}
                style={{ opacity: lang === "es" ? 1 : 0.6, display: "flex", padding: 0 }}
              >
                <img
                  src="/design/flag_es.png"
                  alt="Español"
                  style={{ width: "24px", height: "auto" }}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Hero Section (Topo Institucional) */}
      <section className="hero" id="inicio">
        <div className="container">
          <div className="hero-grid">
            {/* Lado Esquerdo: Informações do Simpósio */}
            <div className="hero-content">
              <div className="hero-logo-box">
                <img
                  src="/design/hero_logo.png"
                  alt={t.hero.altLogo}
                  className="hero-logo-img"
                />
              </div>

              <div className="hero-details-row">
                <div className="event-details">
                  <div className="detail-item">
                    <svg
                      viewBox="0 0 24 24"
                      width="28"
                      height="28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="event-detail-icon"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <div className="detail-text">
                      <h4>{t.hero.date}</h4>
                    </div>
                  </div>

                  <div className="detail-item">
                    <svg
                      viewBox="0 0 24 24"
                      width="28"
                      height="28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="event-detail-icon"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <div className="detail-text">
                      <h4>{t.hero.time}</h4>
                    </div>
                  </div>

                  <div className="detail-item">
                    <svg
                      viewBox="0 0 24 24"
                      width="28"
                      height="28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="event-detail-icon"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <div className="detail-text">
                      <h4>{t.hero.location}</h4>
                      <p>
                        {t.hero.address.split("\n")[0]}<br />
                        {t.hero.address.split("\n")[1]}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Box de Inscrição Rápida */}
                <div className="hero-quick-card-container">
                  <div className="hero-quick-card">
                    <h3>{t.hero.quickTitle}</h3>
                    <form onSubmit={handleQuickSubmit}>
                      <div className="quick-input-container">
                        <span className="quick-input-label">{t.hero.emailLabel}</span>
                        <input
                          id="quick-email"
                          type="email"
                          placeholder={t.hero.emailPlaceholder}
                          value={quickEmail}
                          onChange={(e) => setQuickEmail(e.target.value)}
                          required
                        />
                      </div>
                      <button type="submit" className="quick-submit-btn">{t.hero.btnInscrevase}</button>
                    </form>
                  </div>
                  <div className="hero-quick-subtitle">
                    {t.hero.modalitySubtitle}
                  </div>
                </div>
              </div>
            </div>

            {/* Middle element (Desktop: Absolute background, Tablet/Mobile: Flow block) */}
            <div className="hero-media-wrapper">
              <img
                src="/design/pets.png"
                alt="Pets"
                className="hero-pets-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Seção do Cronômetro Regressivo */}
      <section className="countdown-section">
        <div className="container">
          <Countdown lang={lang} />
        </div>
      </section>

      {/* 4. Seção do Formulário / Tela de Sucesso */}
      <section className="form-section" id="formulario-inscricao">
        <div className="container">
          {!successData ? (
            <>
              <div className="section-header">
                <h2>{t.form.title}</h2>
              </div>
              <RegisterForm lang={lang} onSuccess={(data) => setSuccessData(data)} />
            </>
          ) : (
            <div className="success-card">
              <div className="success-icon-wrapper">✓</div>
              <h2>{t.success.title}</h2>
              <p>
                {t.success.text.split("12º Simpósio")[0]}
                <strong>
                  {lang === "pt"
                    ? "12º Simpósio de Clínica Médica e Nutrologia Premierpet"
                    : "12º Simposio de Clínica Médica y Nutrología Premierpet"}
                </strong>{" "}
                {t.success.text.split("Premierpet")[1] || ""}
              </p>
              <div className="success-details">
                <h4>{t.success.confirmTitle}</h4>
                <p>
                  <strong>{t.success.name}</strong> {successData.nm_inscrito}
                </p>
                <p>
                  <strong>{t.success.email}</strong> {successData.ds_email}
                </p>
                <p>
                  <strong>{t.success.modality}</strong> {successData.ds_modalidade}
                </p>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--form-text-muted)",
                  marginBottom: "24px",
                }}
              >
                {t.success.emailSentInfo}
              </p>
              <button
                className="btn-secondary"
                onClick={() => {
                  setSuccessData(null);
                  setQuickEmail("");
                }}
              >
                {t.success.btnNew}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 4.5. Seção de Palestrantes (Participações Confirmadas) */}
      <section className="speakers-section">
        <div className="container">
          <div className="section-header">
            <h2 className="speakers-section-title">{t.speakers.title}</h2>
          </div>
          <div className="speakers-list">
            {t.speakers.list.map((speaker, index) => (
              <div key={index} className="speaker-item">
                <div className="speaker-image-container">
                  <img
                    src={speaker.image}
                    alt={speaker.name}
                    className="speaker-photo"
                  />
                </div>
                <div className="speaker-info">
                  <h3 className="speaker-name-row">
                    <span className="speaker-name">{speaker.name}</span>
                    <span className="speaker-time-divider">|</span>
                    <span className="speaker-time">{speaker.time}</span>
                  </h3>
                  <p className="speaker-talk-title">{speaker.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Rodapé Institucional */}
      <footer className="footer">
        <div className="container">
          <div className="footer-logos">
            <div className="partner-logo">
              <span className="partner-logo-title">{t.footer.idealizacao}</span>
              <img
                src="/design/logo_premier.png"
                alt="Premierpet"
                className="footer-logo-img"
              />
            </div>
            <div className="partner-logo">
              <span className="partner-logo-title">{t.footer.realizacao}</span>
              <img
                src="/design/logo_AD.png"
                alt="AD Latinoamericana"
                className="footer-logo-img"
              />
            </div>
          </div>
        </div>
      </footer>

      {/* 6. Suporte Flutuante (WhatsApp) */}
      <SupportWidget lang={lang} />
    </>
  );
}
