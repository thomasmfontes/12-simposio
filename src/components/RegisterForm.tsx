"use client";

import React, { useState } from "react";
import { Language, translations } from "@/lib/translations";
import Toast from "@/components/Toast";

interface RegisterFormProps {
  lang: Language;
  onSuccess: (data: {
    nm_inscrito: string;
    ds_email: string;
    ds_modalidade: string;
  }) => void;
}

export default function RegisterForm({ lang, onSuccess }: RegisterFormProps) {
  const t = translations[lang];

  // Estados do formulário
  const [nome, setNome] = useState("");

  // Data de nascimento separada em Dia, Mês, Ano conforme a arte
  const [dobDia, setDobDia] = useState("");
  const [dobMes, setDobMes] = useState("");
  const [dobAno, setDobAno] = useState("");

  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");

  const [telefone, setTelefone] = useState("");
  const [telefoneConfirm, setTelefoneConfirm] = useState("");

  const [pais, setPais] = useState("Brasil");
  const [cidade, setCidade] = useState("");

  const [graduado, setGraduado] = useState<number | null>(null); // null, 1 (Sim) ou 0 (Não)
  const [curso, setCurso] = useState("Medicina Veterinária");
  const [crmv, setCrmv] = useState("");

  // Fontes de informação (Como ficou sabendo)
  const [comoSoube, setComoSoube] = useState<{ [key: string]: boolean }>({
    "Promotor Técnico": false,
    "Embaixadores Universitários PremieRpet": false,
    "Redes Sociais (Instagram PremierVet, YouTube, TikTok, Linkedin)": false,
    "Professor(a)": false,
    "Outros meios de comunicação": false,
  });
  const [comoSoubeOutro, setComoSoubeOutro] = useState("");

  const [modalidade, setModalidade] = useState(""); // Presencial / Online
  const [lgpdAceite, setLgpdAceite] = useState(false);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Máscaras automáticas para telefone
  const formatPhone = (value: string) => {
    // Remove tudo que não for dígito
    const clean = value.replace(/\D/g, "");
    if (clean.length <= 2) {
      return clean;
    } else if (clean.length <= 6) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
    } else if (clean.length <= 10) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
    } else {
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "main" | "confirm",
  ) => {
    const formatted = formatPhone(e.target.value);
    if (type === "main") {
      setTelefone(formatted);
    } else {
      setTelefoneConfirm(formatted);
    }
  };

  const handleCheckboxChange = (key: string) => {
    setComoSoube((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    // 1. Validações no cliente
    if (!nome.trim()) {
      setErrorMsg(t.form.errors.nameRequired);
      setLoading(false);
      return;
    }

    // Validação de Data de Nascimento
    const diaNum = parseInt(dobDia, 10);
    const mesNum = parseInt(dobMes, 10);
    const anoNum = parseInt(dobAno, 10);

    if (
      isNaN(diaNum) ||
      isNaN(mesNum) ||
      isNaN(anoNum) ||
      diaNum < 1 ||
      diaNum > 31 ||
      mesNum < 1 ||
      mesNum > 12 ||
      anoNum < 1920 ||
      anoNum > new Date().getFullYear()
    ) {
      setErrorMsg(t.form.errors.dobInvalid);
      setLoading(false);
      return;
    }

    const dataNascimento = `${dobAno}-${dobMes.padStart(2, "0")}-${dobDia.padStart(2, "0")}`;

    if (!email.trim() || !emailConfirm.trim()) {
      setErrorMsg(t.form.errors.emailRequired);
      setLoading(false);
      return;
    }

    if (email.trim().toLowerCase() !== emailConfirm.trim().toLowerCase()) {
      setErrorMsg(t.form.errors.emailsNotMatch);
      setLoading(false);
      return;
    }

    if (!telefone.trim() || !telefoneConfirm.trim()) {
      setErrorMsg(t.form.errors.phoneRequired);
      setLoading(false);
      return;
    }

    if (telefone.trim() !== telefoneConfirm.trim()) {
      setErrorMsg(t.form.errors.phonesNotMatch);
      setLoading(false);
      return;
    }

    if (!cidade.trim()) {
      setErrorMsg(t.form.errors.cityRequired);
      setLoading(false);
      return;
    }

    if (graduado === null) {
      setErrorMsg(t.form.errors.graduadoRequired);
      setLoading(false);
      return;
    }

    if (graduado === 1 && !curso.trim()) {
      setErrorMsg(t.form.errors.courseRequired);
      setLoading(false);
      return;
    }

    // Captura as opções marcadas em "Como ficou sabendo"
    const fontesMarcadas = Object.keys(comoSoube).filter(
      (key) => comoSoube[key],
    );
    if (fontesMarcadas.length === 0) {
      setErrorMsg(t.form.errors.howHearRequired);
      setLoading(false);
      return;
    }

    if (comoSoube["Outros meios de comunicação"] && !comoSoubeOutro.trim()) {
      setErrorMsg(t.form.errors.howHearOutroRequired);
      setLoading(false);
      return;
    }

    if (!modalidade) {
      setErrorMsg(t.form.errors.modalityRequired);
      setLoading(false);
      return;
    }

    if (!lgpdAceite) {
      setErrorMsg(t.form.errors.lgpdRequired);
      setLoading(false);
      return;
    }

    // 2. Monta payload
    const payload = {
      nm_inscrito: nome,
      dt_nascimento: dataNascimento,
      ds_email: email,
      ds_email_confirmacao: emailConfirm,
      nu_telefone: telefone,
      nu_telefone_confirmacao: telefoneConfirm,
      nm_pais: pais,
      nm_cidade: cidade,
      fl_graduado: graduado,
      ds_curso_graduacao: graduado === 1 ? curso : null,
      ds_crmv: graduado === 1 ? crmv : null,
      ds_como_soube: fontesMarcadas.map(key => t.form.howHearOptions[key as keyof typeof t.form.howHearOptions] || key).join(", "),
      ds_como_soube_outro: comoSoube["Outros meios de comunicação"]
        ? comoSoubeOutro
        : null,
      ds_modalidade: modalidade,
      fl_lgpd_aceite: lgpdAceite ? 1 : 0,
    };

    // 3. Envia para a API
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        let msg = result.error || t.form.errors.genericError;
        // Traduz mensagens de erro conhecidas se estiver em espanhol
        if (lang === "es") {
          if (msg.includes("já foi cadastrado")) {
            msg = t.form.errors.duplicateEmail;
          } else if (msg.includes("Nome completo é obrigatório")) {
            msg = t.form.errors.nameRequired;
          } else if (msg.includes("Data de nascimento é obrigatória")) {
            msg = t.form.errors.dobInvalid;
          } else if (msg.includes("E-mail é obrigatório")) {
            msg = t.form.errors.emailRequired;
          } else if (msg.includes("não coincidem")) {
            msg = t.form.errors.emailsNotMatch;
          } else if (msg.includes("Telefone é obrigatório")) {
            msg = t.form.errors.phoneRequired;
          } else if (msg.includes("Cidade é obrigatória")) {
            msg = t.form.errors.cityRequired;
          } else if (msg.includes("termos de privacidade")) {
            msg = t.form.errors.lgpdRequired;
          }
        }
        setErrorMsg(msg);
      } else {
        // Sucesso!
        onSuccess({
          nm_inscrito: nome,
          ds_email: email,
          ds_modalidade: modalidade,
        });
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(t.form.errors.connectionError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-card">
      {errorMsg && <Toast message={errorMsg} onClose={() => setErrorMsg("")} type="error" />}

      {/* Seção: Contato Pessoal */}
      <div className="form-group-title">{t.form.contactTitle}</div>

      <div className="form-grid">
        {/* Nome Completo */}
        <div className="input-field-wrapper span-full">
          <label htmlFor="nome">
            {t.form.nameLabel} <span>*</span>
          </label>
          <input
            id="nome"
            type="text"
            required
            className="input-field"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder={t.form.namePlaceholder}
          />
        </div>

        {/* E-mail e Confirmação */}
        <div className="input-field-wrapper">
          <label htmlFor="email">
            {t.form.emailLabel} <span>*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="exemplo@email.com"
          />
        </div>

        <div className="input-field-wrapper">
          <label htmlFor="emailConfirm">
            {t.form.emailConfirmLabel} <span>*</span>
          </label>
          <input
            id="emailConfirm"
            type="email"
            required
            className="input-field"
            value={emailConfirm}
            onChange={(e) => setEmailConfirm(e.target.value)}
            placeholder={t.form.emailConfirmPlaceholder}
          />
        </div>

        {/* Telefone e Confirmação */}
        <div className="input-field-wrapper">
          <label htmlFor="telefone">
            {t.form.phoneLabel} <span>*</span>
          </label>
          <input
            id="telefone"
            type="tel"
            required
            className="input-field"
            value={telefone}
            onChange={(e) => handlePhoneChange(e, "main")}
            placeholder="(11) 99999-9999"
          />
        </div>

        <div className="input-field-wrapper">
          <label htmlFor="telefoneConfirm">
            {t.form.phoneConfirmLabel} <span>*</span>
          </label>
          <input
            id="telefoneConfirm"
            type="tel"
            required
            className="input-field"
            value={telefoneConfirm}
            onChange={(e) => handlePhoneChange(e, "confirm")}
            placeholder={t.form.phoneConfirmPlaceholder}
          />
        </div>

        {/* País e Cidade */}
        <div className="input-field-wrapper">
          <label htmlFor="pais">
            {t.form.countryLabel} <span>*</span>
          </label>
          <select
            id="pais"
            className="input-field"
            value={pais}
            onChange={(e) => setPais(e.target.value)}
            style={{ appearance: "auto" }}
          >
            {t.form.countries.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="input-field-wrapper">
          <label htmlFor="cidade">
            {t.form.cityLabel} <span>*</span>
          </label>
          <input
            id="cidade"
            type="text"
            required
            className="input-field"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            placeholder={t.form.cityPlaceholder}
          />
        </div>

        {/* Data de Nascimento - 3 Caixas */}
        <div className="input-field-wrapper">
          <label>
            {t.form.dobLabel} <span>*</span>
          </label>
          <div className="dob-grid">
            <input
              type="text"
              required
              maxLength={2}
              className="input-field"
              value={dobDia}
              onChange={(e) => setDobDia(e.target.value.replace(/\D/g, ""))}
              placeholder="DD"
            />
            <input
              type="text"
              required
              maxLength={2}
              className="input-field"
              value={dobMes}
              onChange={(e) => setDobMes(e.target.value.replace(/\D/g, ""))}
              placeholder="MM"
            />
            <input
              type="text"
              required
              maxLength={4}
              className="input-field"
              value={dobAno}
              onChange={(e) => setDobAno(e.target.value.replace(/\D/g, ""))}
              placeholder="AAAA"
            />
          </div>
        </div>

        {/* Graduado - Sim / Não */}
        <div className="input-field-wrapper">
          <label>
            {t.form.graduadoLabel} <span>*</span>
          </label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="graduado"
                checked={graduado === 1}
                onChange={() => setGraduado(1)}
              />
              {t.form.yes}
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="graduado"
                checked={graduado === 0}
                onChange={() => setGraduado(0)}
              />
              {t.form.no}
            </label>
          </div>
        </div>

        {/* Seção Condicional de Graduação */}
        {graduado === 1 && (
          <>
            <div className="input-field-wrapper">
              <label htmlFor="curso">
                {t.form.courseLabel} <span>*</span>
              </label>
              <select
                id="curso"
                className="input-field"
                value={curso}
                onChange={(e) => setCurso(e.target.value)}
                style={{ appearance: "auto" }}
              >
                {t.form.courses.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-field-wrapper">
              <label htmlFor="crmv">{t.form.crmvLabel}</label>
              <input
                id="crmv"
                type="text"
                className="input-field"
                value={crmv}
                onChange={(e) => setCrmv(e.target.value)}
                placeholder={t.form.crmvPlaceholder}
              />
            </div>
          </>
        )}

        {/* Como ficou sabendo */}
        <div
          className="input-field-wrapper span-full"
          style={{ marginTop: "10px" }}
        >
          <label>
            {t.form.howHearLabel} <span>*</span>
          </label>
          <div className="checkbox-list-grid">
            {Object.keys(comoSoube).map((key) => (
              <label key={key} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={comoSoube[key]}
                  onChange={() => handleCheckboxChange(key)}
                />
                {t.form.howHearOptions[key as keyof typeof t.form.howHearOptions] || key}
              </label>
            ))}
          </div>
        </div>

        {comoSoube["Outros meios de comunicação"] && (
          <div
            className="input-field-wrapper span-full"
            style={{ animation: "fadeIn 0.2s ease-out" }}
          >
            <label htmlFor="comoSoubeOutro">
              {t.form.whichOnes} <span>*</span>
            </label>
            <input
              id="comoSoubeOutro"
              type="text"
              required
              className="input-field"
              value={comoSoubeOutro}
              onChange={(e) => setComoSoubeOutro(e.target.value)}
              placeholder={t.form.whichOnesPlaceholder}
            />
          </div>
        )}

        {/* Modalidade */}
        <div
          className="input-field-wrapper span-full"
          style={{ marginTop: "10px" }}
        >
          <label>
            {t.form.modalityLabel} <span>*</span>
          </label>
          <div className="radio-group" style={{ gap: "30px" }}>
            <label className="radio-option">
              <input
                type="radio"
                name="modalidade"
                checked={modalidade === "Online"}
                onChange={() => setModalidade("Online")}
              />
              ONLINE
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="modalidade"
                checked={modalidade === "Presencial"}
                onChange={() => setModalidade("Presencial")}
              />
              PRESENCIAL
            </label>
          </div>
        </div>
      </div>

      {/* Aceite LGPD */}
      <div className="lgpd-wrapper">
        <label className="lgpd-option">
          <input
            type="checkbox"
            required
            checked={lgpdAceite}
            onChange={(e) => setLgpdAceite(e.target.checked)}
          />
          <span>
            {t.form.lgpdText}{" "}
            <a href="https://premierpet.com.br/privacidade/" target="_blank" rel="noopener noreferrer">
              {t.form.lgpdLink}
            </a>
          </span>
        </label>
      </div>

      {/* Aviso Importante */}
      <div className="notice-box">
        <h4>{t.form.importantTitle}</h4>
        <p>
          <b>
            {t.form.importantText.pre}
            <span style={{ color: "var(--text-white)" }}>
              {t.form.importantText.highlight}
            </span>
            {t.form.importantText.post}
          </b>
        </p>
      </div>

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? t.form.processing : t.form.btnSubmit}
      </button>
    </form>
  );
}
