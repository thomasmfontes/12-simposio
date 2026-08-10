"use client";

import React, { useState, useEffect } from "react";
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

export interface CountryPhoneConfig {
  name: string;
  nameEs: string;
  iso: string;
  ddi: string;
  placeholder: string;
}

export const COUNTRY_PHONE_CONFIGS: CountryPhoneConfig[] = [
  { name: "Brasil", nameEs: "Brasil", iso: "br", ddi: "+55", placeholder: "(11) 99999-9999" },
  { name: "Bolívia", nameEs: "Bolivia", iso: "bo", ddi: "+591", placeholder: "7000-0000" },
  { name: "Chile", nameEs: "Chile", iso: "cl", ddi: "+56", placeholder: "9 1234 5678" },
  { name: "Colômbia", nameEs: "Colombia", iso: "co", ddi: "+57", placeholder: "300 123 4567" },
  { name: "Equador", nameEs: "Ecuador", iso: "ec", ddi: "+593", placeholder: "099 123 4567" },
  { name: "Paraguai", nameEs: "Paraguay", iso: "py", ddi: "+595", placeholder: "981 123 456" },
  { name: "Uruguai", nameEs: "Uruguay", iso: "uy", ddi: "+598", placeholder: "99 123 456" },
  { name: "Argentina", nameEs: "Argentina", iso: "ar", ddi: "+54", placeholder: "11 1234-5678" },
  { name: "Peru", nameEs: "Perú", iso: "pe", ddi: "+51", placeholder: "912 345 678" },
  { name: "Espanha", nameEs: "España", iso: "es", ddi: "+34", placeholder: "612 345 678" },
  { name: "Portugal", nameEs: "Portugal", iso: "pt", ddi: "+351", placeholder: "912 345 678" },
  { name: "Angola", nameEs: "Angola", iso: "ao", ddi: "+244", placeholder: "912 345 678" },
  { name: "Cabo Verde", nameEs: "Cabo Verde", iso: "cv", ddi: "+238", placeholder: "912 3456" },
  { name: "Moçambique", nameEs: "Mozambique", iso: "mz", ddi: "+258", placeholder: "82 123 4567" },
  { name: "Outro", nameEs: "Otro", iso: "un", ddi: "+", placeholder: "123456789" },
];

const renderFlagIcon = (iso: string, name: string) => {
  if (iso === "un") {
    return (
      <svg className="flag-img globe-icon" width="22" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
        <path d="M2 12h20"/>
      </svg>
    );
  }
  return (
    <img
      src={`https://flagcdn.com/w40/${iso}.png`}
      alt={name}
      width="22"
      height="15"
      className="flag-img"
    />
  );
};

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

  const [modalidade, setModalidade] = useState("Online"); // Padrão: Online
  const [lgpdAceite, setLgpdAceite] = useState(false);
  const [comunicacoesAceite, setComunicacoesAceite] = useState(false);
  const [presencialFull, setPresencialFull] = useState(true); // Padrão: Travado/Esgotado

  // Seletor de país/bandeira para o campo de telefone e país
  const [openPhoneDropdown, setOpenPhoneDropdown] = useState(false);
  const [openPhoneConfirmDropdown, setOpenPhoneConfirmDropdown] = useState(false);
  const [openPaisDropdown, setOpenPaisDropdown] = useState(false);
  const [searchPhone, setSearchPhone] = useState("");

  const phoneContainerRef = React.useRef<HTMLDivElement>(null);
  const phoneConfirmContainerRef = React.useRef<HTMLDivElement>(null);
  const paisContainerRef = React.useRef<HTMLDivElement>(null);

  const currentCountryConfig =
    COUNTRY_PHONE_CONFIGS.find(
      (c) => c.name === pais || c.nameEs === pais
    ) || COUNTRY_PHONE_CONFIGS[0];

  const filteredPhoneConfigs = COUNTRY_PHONE_CONFIGS.filter((c) => {
    const term = searchPhone.toLowerCase().trim();
    if (!term) return true;
    return (
      c.name.toLowerCase().includes(term) ||
      c.nameEs.toLowerCase().includes(term) ||
      c.ddi.includes(term)
    );
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        phoneContainerRef.current &&
        !phoneContainerRef.current.contains(event.target as Node)
      ) {
        setOpenPhoneDropdown(false);
      }
      if (
        phoneConfirmContainerRef.current &&
        !phoneConfirmContainerRef.current.contains(event.target as Node)
      ) {
        setOpenPhoneConfirmDropdown(false);
      }
      if (
        paisContainerRef.current &&
        !paisContainerRef.current.contains(event.target as Node)
      ) {
        setOpenPaisDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Efeito para verificar a capacidade e status do evento
  useEffect(() => {
    async function checkCapacity() {
      try {
        const res = await fetch("/api/check-capacity");
        if (res.ok) {
          const data = await res.json();
          const isLockedOrFull = data.presencialFull === true || data.presencialLocked === true;
          setPresencialFull(isLockedOrFull);
          if (isLockedOrFull) {
            setModalidade("Online");
          }
        }
      } catch (err) {
        console.error("Erro ao verificar capacidade presencial:", err);
      }
    }
    checkCapacity();
  }, []);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Máscaras automáticas para telefone
  const formatPhone = (value: string, selectedPais: string = pais) => {
    if (selectedPais === "Brasil") {
      // Remove tudo que não for dígito
      const clean = value.replace(/\D/g, "");
      if (clean.length === 0) return "";
      if (clean.length <= 2) {
        return clean;
      } else if (clean.length <= 6) {
        return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
      } else if (clean.length <= 10) {
        return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
      } else {
        return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
      }
    } else {
      // Para telefones internacionais (Colômbia, Bolívia, Equador, etc.)
      // Permite código internacional (+), DDD de 3+ dígitos, números, espaços, hífens e parênteses sem truncar
      return value.replace(/[^\d\s+\-()]/g, "").slice(0, 25);
    }
  };

  const handlePhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "main" | "confirm",
  ) => {
    const formatted = formatPhone(e.target.value, pais);
    if (type === "main") {
      setTelefone(formatted);
    } else {
      setTelefoneConfirm(formatted);
    }
  };

  const handlePaisChange = (newPais: string) => {
    setPais(newPais);
    if (telefone) {
      setTelefone(formatPhone(telefone, newPais));
    }
    if (telefoneConfirm) {
      setTelefoneConfirm(formatPhone(telefoneConfirm, newPais));
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
    const getFullPhone = (phoneVal: string) => {
      const cleanVal = phoneVal.trim();
      if (!cleanVal) return "";
      if (pais === "Brasil" || cleanVal.startsWith("+")) return cleanVal;
      return `${currentCountryConfig.ddi} ${cleanVal}`;
    };

    const finalPhone = getFullPhone(telefone);
    const finalPhoneConfirm = getFullPhone(telefoneConfirm);

    const payload = {
      nm_inscrito: nome,
      dt_nascimento: dataNascimento,
      ds_email: email,
      ds_email_confirmacao: emailConfirm,
      nu_telefone: finalPhone,
      nu_telefone_confirmacao: finalPhoneConfirm,
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
      fl_comunicacoes_aceite: comunicacoesAceite ? 1 : 0,
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
          } else if (msg.includes("vagas presenciais estão esgotadas")) {
            msg = t.form.errors.presencialSoldOut;
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

        {/* Telefone e Confirmação com Seletor de Bandeira */}
        <div className="input-field-wrapper">
          <label htmlFor="telefone">
            {t.form.phoneLabel} <span>*</span>
          </label>
          <div className="phone-input-container" ref={phoneContainerRef}>
            <button
              type="button"
              className="phone-flag-trigger"
              onClick={() => {
                setOpenPhoneDropdown(!openPhoneDropdown);
                setSearchPhone("");
              }}
              title="Selecionar país / DDI"
            >
              {renderFlagIcon(currentCountryConfig.iso, currentCountryConfig.name)}
              <span className="ddi-code">{currentCountryConfig.ddi}</span>
              <span className={`arrow-icon ${openPhoneDropdown ? "open" : ""}`}>
                ▼
              </span>
            </button>
            <input
              id="telefone"
              type="tel"
              required
              className="input-field input-field-with-flag"
              value={telefone}
              onChange={(e) => handlePhoneChange(e, "main")}
              placeholder={currentCountryConfig.placeholder}
            />
            {openPhoneDropdown && (
              <div className="phone-flag-dropdown">
                <div className="flag-search-box">
                  <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    className="flag-search-input"
                    placeholder={lang === "es" ? "Buscar país o código..." : "Buscar país ou código..."}
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                </div>
                <div className="phone-flag-options-list">
                  {filteredPhoneConfigs.length === 0 ? (
                    <div style={{ padding: "12px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                      {lang === "es" ? "No se encontraron países" : "Nenhum país encontrado"}
                    </div>
                  ) : (
                    filteredPhoneConfigs.map((item) => (
                      <div
                        key={item.name}
                        className={`phone-flag-option ${
                          item.name === pais ? "selected" : ""
                        }`}
                        onClick={() => {
                          handlePaisChange(item.name);
                          setOpenPhoneDropdown(false);
                        }}
                      >
                        <div className="phone-flag-option-left">
                          {renderFlagIcon(item.iso, item.name)}
                          <span className="phone-flag-option-name">
                            {lang === "es" ? item.nameEs : item.name}
                          </span>
                        </div>
                        <span className="phone-flag-option-ddi">{item.ddi}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="input-field-wrapper">
          <label htmlFor="telefoneConfirm">
            {t.form.phoneConfirmLabel} <span>*</span>
          </label>
          <div className="phone-input-container" ref={phoneConfirmContainerRef}>
            <button
              type="button"
              className="phone-flag-trigger"
              onClick={() => {
                setOpenPhoneConfirmDropdown(!openPhoneConfirmDropdown);
                setSearchPhone("");
              }}
              title="Selecionar país / DDI"
            >
              {renderFlagIcon(currentCountryConfig.iso, currentCountryConfig.name)}
              <span className="ddi-code">{currentCountryConfig.ddi}</span>
              <span
                className={`arrow-icon ${
                  openPhoneConfirmDropdown ? "open" : ""
                }`}
              >
                ▼
              </span>
            </button>
            <input
              id="telefoneConfirm"
              type="tel"
              required
              className="input-field input-field-with-flag"
              value={telefoneConfirm}
              onChange={(e) => handlePhoneChange(e, "confirm")}
              placeholder={currentCountryConfig.placeholder}
            />
            {openPhoneConfirmDropdown && (
              <div className="phone-flag-dropdown">
                <div className="flag-search-box">
                  <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    className="flag-search-input"
                    placeholder={lang === "es" ? "Buscar país o código..." : "Buscar país ou código..."}
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                </div>
                <div className="phone-flag-options-list">
                  {filteredPhoneConfigs.length === 0 ? (
                    <div style={{ padding: "12px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                      {lang === "es" ? "No se encontraron países" : "Nenhum país encontrado"}
                    </div>
                  ) : (
                    filteredPhoneConfigs.map((item) => (
                      <div
                        key={item.name}
                        className={`phone-flag-option ${
                          item.name === pais ? "selected" : ""
                        }`}
                        onClick={() => {
                          handlePaisChange(item.name);
                          setOpenPhoneConfirmDropdown(false);
                        }}
                      >
                        <div className="phone-flag-option-left">
                          {renderFlagIcon(item.iso, item.name)}
                          <span className="phone-flag-option-name">
                            {lang === "es" ? item.nameEs : item.name}
                          </span>
                        </div>
                        <span className="phone-flag-option-ddi">{item.ddi}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* País e Cidade */}
        <div className="input-field-wrapper">
          <label htmlFor="pais">
            {t.form.countryLabel} <span>*</span>
          </label>
          <div className="custom-country-select-container" ref={paisContainerRef}>
            <div
              className="custom-country-select-trigger"
              onClick={() => setOpenPaisDropdown(!openPaisDropdown)}
            >
              <div className="custom-country-selected-info">
                {renderFlagIcon(currentCountryConfig.iso, currentCountryConfig.name)}
                <span>
                  {lang === "es"
                    ? currentCountryConfig.nameEs
                    : currentCountryConfig.name}
                </span>
              </div>
              <span className={`arrow-icon ${openPaisDropdown ? "open" : ""}`}>
                ▼
              </span>
            </div>

            {openPaisDropdown && (
              <div className="custom-country-dropdown">
                {COUNTRY_PHONE_CONFIGS.map((item) => (
                  <div
                    key={item.name}
                    className={`custom-country-option ${
                      item.name === pais ? "selected" : ""
                    }`}
                    onClick={() => {
                      handlePaisChange(item.name);
                      setOpenPaisDropdown(false);
                    }}
                  >
                    <div className="custom-country-option-left">
                      {renderFlagIcon(item.iso, item.name)}
                      <span>
                        {lang === "es" ? item.nameEs : item.name}
                      </span>
                    </div>
                    {item.name === pais && (
                      <svg
                        className="check-icon"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#0056b3"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
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
            <label className={`radio-option ${presencialFull ? "disabled" : ""}`}>
              <input
                type="radio"
                name="modalidade"
                checked={modalidade === "Presencial"}
                disabled={presencialFull}
                onChange={() => !presencialFull && setModalidade("Presencial")}
              />
              PRESENCIAL {presencialFull && <span style={{ color: "#ef4444", fontSize: "11px", fontWeight: "700", marginLeft: "4px" }}>({t.form.soldOutLabel})</span>}
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

      {/* Aceite de Comunicações */}
      <div className="lgpd-wrapper" style={{ marginTop: "12px" }}>
        <label className="lgpd-option">
          <input
            type="checkbox"
            checked={comunicacoesAceite}
            onChange={(e) => setComunicacoesAceite(e.target.checked)}
          />
          <span>{t.form.comunicacoesText}</span>
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
