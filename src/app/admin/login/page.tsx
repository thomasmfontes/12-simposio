"use client";

import React, { useState } from "react";
import { loginAdmin } from "./actions";

export default function AdminLogin() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await loginAdmin(formData);
      if (res.success) {
        // Redireciona para o painel admin
        window.location.href = "/admin";
        // Não definimos loading como false para manter o spinner girando durante o carregamento da nova página
      } else {
        setError(res.error || "Erro ao fazer login.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Ocorreu um erro ao processar seu login.");
      setLoading(false);
    }
  };

  return (
    <div className="admin-layout" style={{ position: "relative", overflow: "hidden" }}>
      {/* Elementos Decorativos de Fundo (Glow Orbs) */}
      <div className="login-bg-glow login-bg-glow-1"></div>
      <div className="login-bg-glow login-bg-glow-2"></div>

      <div className="container" style={{ position: "relative", zIndex: 1, animation: "fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
        <div className="login-container">
          <div className="login-card">
            <div className="login-icon-header">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2>Área Administrativa</h2>
            <p>Identifique-se para acessar o painel de inscritos.</p>

            {error && (
              <div className="error-message-box">
                <svg xmlns="http://www.w3.org/2000/svg" className="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "18px" }}
            >
              <div className="input-field-wrapper">
                <label htmlFor="username">Usuário</label>
                <div className="input-with-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="input-field"
                    placeholder="Nome de usuário"
                  />
                </div>
              </div>

              <div className="input-field-wrapper">
                <label htmlFor="password">Senha</label>
                <div className="input-with-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="input-field"
                    placeholder="Digite sua senha"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary btn-with-icon login-submit-btn"
                disabled={loading}
                style={{ marginTop: "12px", width: "100%", height: "46px" }}
              >
                {loading ? (
                  <>
                    <div className="spinner-loader-small"></div>
                    Autenticando...
                  </>
                ) : (
                  <>
                    Entrar no Painel
                    <svg xmlns="http://www.w3.org/2000/svg" className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
