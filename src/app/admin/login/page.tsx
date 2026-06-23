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
      } else {
        setError(res.error || "Erro ao fazer login.");
      }
    } catch (err) {
      console.error(err);
      setError("Ocorreu um erro ao processar seu login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-layout">
      <div className="container">
        <div className="login-container">
          <div className="login-card">
            <h2>Área Administrativa</h2>
            <p>Identifique-se para acessar o painel de inscritos.</p>

            {error && <div className="error-message-box">{error}</div>}

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div className="input-field-wrapper">
                <label htmlFor="username">Usuário</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Nome de usuário"
                />
              </div>

              <div className="input-field-wrapper">
                <label htmlFor="password">Senha</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input-field"
                  placeholder="Digite sua senha"
                />
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
                style={{ marginTop: "10px" }}
              >
                {loading ? "Autenticando..." : "ENTRAR NO PAINEL"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
