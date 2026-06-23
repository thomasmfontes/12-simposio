"use client";

import React, { useState, useEffect } from "react";
import { logoutAdmin } from "@/app/admin/login/actions";
import { jsPDF } from "jspdf";

export interface InscritoData {
  id_inscrito: number;
  nm_inscrito: string;
  dt_nascimento: string;
  ds_email: string;
  nu_telefone: string;
  nm_pais: string;
  nm_cidade: string;
  fl_graduado: number;
  ds_curso_graduacao?: string | null;
  ds_crmv?: string | null;
  ds_como_soube: string;
  ds_como_soube_outro?: string | null;
  ds_modalidade: string;
  fl_lgpd_aceite: number;
  dt_cadastro: string;
}

interface Metrics {
  total: number;
  presencial: number;
  online: number;
}

interface AdminDashboardProps {
  initialInscritos: InscritoData[];
  initialMetrics: Metrics;
  initialCidades: string[];
}

interface CustomSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  icon: React.ReactNode;
}

function CustomSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  icon,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="custom-select-container" ref={dropdownRef}>
      <label className="custom-select-label">{label}</label>
      <div
        className={`custom-select-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="custom-select-trigger-left">
          {icon}
          <span className="custom-select-text">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`custom-select-arrow ${isOpen ? "open" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <ul className="custom-select-options">
          {options.map((opt) => (
            <li
              key={opt.value}
              className={`custom-select-option ${
                opt.value === value ? "selected" : ""
              }`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
              {opt.value === value && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="check-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminDashboard({
  initialInscritos,
  initialMetrics,
  initialCidades,
}: AdminDashboardProps) {
  // Estados para dados e filtros
  const [inscritos, setInscritos] = useState<InscritoData[]>(initialInscritos);
  const [metrics, setMetrics] = useState<Metrics>(initialMetrics);
  const [cidades, setCidades] = useState<string[]>(initialCidades);

  const [filterSearch, setFilterSearch] = useState("");
  const [filterCidade, setFilterCidade] = useState("");
  const [filterModalidade, setFilterModalidade] = useState("");
  const [filterDataInicio, setFilterDataInicio] = useState("");
  const [filterDataFim, setFilterDataFim] = useState("");

  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const tableWrapperRef = React.useRef<HTMLDivElement>(null);

  // Efeito de Grab-to-Scroll para arrastar a tabela com o mouse
  useEffect(() => {
    const slider = tableWrapperRef.current;
    if (!slider) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const handleMouseDown = (e: MouseEvent) => {
      // Impede o arraste ao interagir com inputs, botões, links, seletores ou SVGs
      const target = e.target as HTMLElement;
      if (
        target.closest("button") ||
        target.closest("input") ||
        target.closest("a") ||
        target.closest(".custom-select-container") ||
        target.closest("svg")
      ) {
        return;
      }

      isDown = true;
      slider.classList.add("dragging");
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      slider.classList.remove("dragging");
    };

    const handleMouseUp = () => {
      isDown = false;
      slider.classList.remove("dragging");
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 1.5; // Velocidade de arrasto
      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener("mousedown", handleMouseDown);
    slider.addEventListener("mouseleave", handleMouseLeave);
    slider.addEventListener("mouseup", handleMouseUp);
    slider.addEventListener("mousemove", handleMouseMove);

    return () => {
      slider.removeEventListener("mousedown", handleMouseDown);
      slider.removeEventListener("mouseleave", handleMouseLeave);
      slider.removeEventListener("mouseup", handleMouseUp);
      slider.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Busca dados atualizados da API ao alterar filtros
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (filterSearch) queryParams.set("q", filterSearch);
        if (filterCidade) queryParams.set("cidade", filterCidade);
        if (filterModalidade) queryParams.set("modalidade", filterModalidade);
        if (filterDataInicio) queryParams.set("data_inicio", filterDataInicio);
        if (filterDataFim) queryParams.set("data_fim", filterDataFim);

        const response = await fetch(
          `/api/admin/inscritos?${queryParams.toString()}`,
        );
        const result = await response.json();

        if (response.ok && result.success) {
          setInscritos(result.data);
          setMetrics(result.metrics);
          setCidades(result.cidades);
        }
      } catch (err) {
        console.error("Erro ao filtrar dados:", err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce na pesquisa por texto para evitar múltiplas requisições por segundo
    const timeout = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(timeout);
  }, [
    filterSearch,
    filterCidade,
    filterModalidade,
    filterDataInicio,
    filterDataFim,
  ]);

  // Função para limpar filtros
  const handleClearFilters = () => {
    setFilterSearch("");
    setFilterCidade("");
    setFilterModalidade("");
    setFilterDataInicio("");
    setFilterDataFim("");
  };

  // Seleção individual de checkbox
  const handleSelectRow = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Seleção de todos os itens da tabela visível
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const ids = inscritos.map((i) => i.id_inscrito);
      setSelectedIds(new Set(ids));
    } else {
      setSelectedIds(new Set());
    }
  };

  const isAllSelected =
    inscritos.length > 0 && selectedIds.size === inscritos.length;

  // Exclusão de participante (limpeza de testes)
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Deseja realmente excluir a inscrição de "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/inscritos?id=${id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (response.ok && result.success) {
        // Remove do estado
        setInscritos((prev) => prev.filter((i) => i.id_inscrito !== id));
        // Remove da seleção
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        // Atualiza métricas disparando um recarregamento silencioso dos filtros
        setFilterSearch((p) => p + " ");
        setTimeout(() => setFilterSearch((p) => p.trim()), 50);
      } else {
        alert(result.error || "Erro ao excluir participante.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão ao excluir participante.");
    }
  };

  // Exportar para Excel/CSV usando separador ponto e vírgula e BOM (compatível com Excel PT-BR)
  const handleExportCSV = () => {
    if (inscritos.length === 0) {
      alert("Nenhum registro para exportar.");
      return;
    }

    const headers = [
      "ID",
      "Nome Completo",
      "Data Nascimento",
      "E-mail",
      "Telefone",
      "País",
      "Cidade",
      "Graduado",
      "Curso",
      "CRMV",
      "Como soube",
      "Outros detalhes",
      "Modalidade",
      "Aceite LGPD",
      "Data Cadastro",
    ];

    const rows = inscritos.map((p) => [
      p.id_inscrito,
      p.nm_inscrito,
      p.dt_nascimento,
      p.ds_email,
      p.nu_telefone,
      p.nm_pais,
      p.nm_cidade,
      p.fl_graduado === 1 ? "Sim" : "Não",
      p.ds_curso_graduacao || "",
      p.ds_crmv || "",
      p.ds_como_soube,
      p.ds_como_soube_outro || "",
      p.ds_modalidade,
      p.fl_lgpd_aceite === 1 ? "Sim" : "Não",
      p.dt_cadastro,
    ]);

    // O prefixo \uFEFF força o Excel a interpretar o arquivo como UTF-8 com acentuações corretas
    const csvContent =
      "\uFEFF" +
      [
        headers.join(";"),
        ...rows.map((row) =>
          row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(";"),
        ),
      ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `inscritos_12_simposio_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Gerar Crachás em PDF (8x4 cm = 80mm x 40mm)
  const handleGenerateBadges = (onlySelected: boolean) => {
    const listToGenerate = onlySelected
      ? inscritos.filter((i) => selectedIds.has(i.id_inscrito))
      : inscritos;

    if (listToGenerate.length === 0) {
      alert("Selecione pelo menos um participante para gerar o crachá.");
      return;
    }

    // Inicializa o PDF com tamanho personalizado 80x40 mm em formato paisagem (landscape)
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [80, 40],
    });

    listToGenerate.forEach((p, index) => {
      // Cria uma nova página a partir do segundo elemento
      if (index > 0) {
        doc.addPage([80, 40], "landscape");
      }

      // 1. Faixa Superior (Institucional) - Azul Escuro do Simpósio
      doc.setFillColor(12, 33, 68); // #0c2144
      doc.rect(0, 0, 80, 6, "F");

      // 2. Linha inferior decorativa - Azul Destaque
      doc.setFillColor(0, 122, 255); // #007aff
      doc.rect(0, 38, 80, 2, "F");

      // 3. Texto da Faixa Superior
      doc.setTextColor(255, 255, 255);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text("12º SIMPÓSIO PREMIERVET", 40, 4.2, { align: "center" });

      // 4. Nome do Participante (Tamanho dinâmico dependendo da quantidade de caracteres)
      doc.setTextColor(30, 41, 59); // Slate 800
      let nameFontSize = 13;
      const name = p.nm_inscrito.toUpperCase();
      if (name.length > 25) nameFontSize = 10;
      if (name.length > 35) nameFontSize = 8.5;

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(nameFontSize);
      doc.text(name, 40, 16, { align: "center" });

      // 5. Cidade / UF / País
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      const localString =
        p.nm_cidade + (p.nm_pais !== "Brasil" ? ` - ${p.nm_pais}` : "");
      doc.text(localString, 40, 21.5, { align: "center" });

      // 6. CRMV (Se houver)
      if (p.ds_crmv) {
        doc.setFont("Helvetica", "oblique");
        doc.setFontSize(8);
        doc.text(`CRMV: ${p.ds_crmv}`, 40, 26.5, { align: "center" });
      }

      // 7. Modalidade com estilo Badge Centralizado
      const isPresencial = p.ds_modalidade === "Presencial";

      // Cor de fundo do badge
      if (isPresencial) {
        doc.setFillColor(209, 250, 229); // Verde Claro (#d1fae5)
        doc.setTextColor(5, 150, 105); // Verde Escuro (#059669)
      } else {
        doc.setFillColor(219, 234, 254); // Azul Claro (#dbeafe)
        doc.setTextColor(37, 99, 235); // Azul Escuro (#2563eb)
      }

      // Desenha fundo do badge (largura 30mm, altura 4.5mm)
      doc.roundedRect(25, 30, 30, 4.5, 0.8, 0.8, "F");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(7);
      doc.text(p.ds_modalidade.toUpperCase(), 40, 33.2, { align: "center" });
    });

    doc.save(`crachas_8x4_${listToGenerate.length}_participantes.pdf`);
  };

  const handleLogout = async () => {
    await logoutAdmin();
    window.location.href = "/admin/login";
  };

  return (
    <div className="container" style={{ animation: "fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
      {/* Cabeçalho */}
      <div className="admin-header">
        <div className="admin-header-title">
          <div className="admin-title-badge">PAINEL DE CONTROLE</div>
          <h1>Painel Administrativo</h1>
          <p>Gerenciamento e monitoramento de inscritos no 12º Simpósio</p>
        </div>
        <div className="admin-actions">
          <button className="btn-outline btn-logout" onClick={handleLogout}>
            <svg xmlns="http://www.w3.org/2000/svg" className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair do Painel
          </button>
        </div>
      </div>

      {/* Grid de Métricas Gerais */}
      <div className="metrics-grid">
        {/* Total */}
        <div className="metric-card metric-total">
          <div className="metric-card-header">
            <span className="metric-title">Geral Inscritos</span>
            <div className="metric-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <span className="metric-value">{metrics.total}</span>
          <span className="metric-subtitle">Total de inscrições recebidas</span>
        </div>

        {/* Presencial */}
        <div className="metric-card metric-presencial">
          <div className="metric-card-header">
            <span className="metric-title">Presencial</span>
            <div className="metric-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <span className="metric-value">{metrics.presencial}</span>
          <span className="metric-subtitle">Vagas presenciais reservadas</span>
        </div>

        {/* Online */}
        <div className="metric-card metric-online">
          <div className="metric-card-header">
            <span className="metric-title">Online</span>
            <div className="metric-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <span className="metric-value">{metrics.online}</span>
          <span className="metric-subtitle">Inscritos para a transmissão ao vivo</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-card">
        <div className="filters-grid">
          {/* Busca por Nome/Email */}
          <div className="input-field-wrapper">
            <label>Busca Textual</label>
            <div className="input-with-icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                className="input-field"
                placeholder="Nome ou E-mail..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Filtro Cidade */}
          <CustomSelect
            label="Cidade"
            value={filterCidade}
            onChange={setFilterCidade}
            placeholder="Todas as cidades"
            options={[
              { value: "", label: "Todas as cidades" },
              ...cidades.map((c) => ({ value: c, label: c })),
            ]}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />

          {/* Filtro Modalidade */}
          <CustomSelect
            label="Modalidade"
            value={filterModalidade}
            onChange={setFilterModalidade}
            placeholder="Todas"
            options={[
              { value: "", label: "Todas" },
              { value: "Presencial", label: "Presencial" },
              { value: "Online", label: "Online" },
            ]}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            }
          />

          {/* Filtro Período de Inscrição */}
          <div className="input-field-wrapper">
            <label>Período de Inscrição</label>
            <div className="date-range-inputs">
              <div className="input-with-icon date-input-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input
                  type="date"
                  className="input-field date-input"
                  value={filterDataInicio}
                  onChange={(e) => setFilterDataInicio(e.target.value)}
                />
              </div>
              <span className="date-separator">até</span>
              <div className="input-with-icon date-input-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input
                  type="date"
                  className="input-field date-input"
                  value={filterDataFim}
                  onChange={(e) => setFilterDataFim(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {(filterSearch ||
          filterCidade ||
          filterModalidade ||
          filterDataInicio ||
          filterDataFim) && (
          <div className="filter-actions-bar">
            <button className="filter-clear-btn" onClick={handleClearFilters}>
              Limpar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Tabela de Inscritos */}
      <div className="table-card">
        <div className="table-header-bar">
          <div className="table-header-title">
            Lista de Inscritos
            <span className="table-counter-badge">{inscritos.length}</span>
          </div>

          <div className="table-selection-actions">
            {/* Exportar CSV */}
            <button className="btn-outline btn-with-icon" onClick={handleExportCSV}>
              <svg xmlns="http://www.w3.org/2000/svg" className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar CSV
            </button>

            {/* Gerar Crachás dos Selecionados */}
            <button
              className="btn-primary btn-with-icon btn-badge-primary"
              onClick={() => handleGenerateBadges(true)}
              disabled={selectedIds.size === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.333 0 4 .667 4 2v1H5v-1c0-1.333 2.667-2 4-2z" />
              </svg>
              Crachás Selecionados ({selectedIds.size})
            </button>

            {/* Gerar Crachás de Todos os Filtrados */}
            <button
              className="btn-outline btn-with-icon"
              onClick={() => handleGenerateBadges(false)}
              disabled={inscritos.length === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Crachás Todos ({inscritos.length})
            </button>
          </div>
        </div>

        <div className="table-wrapper" ref={tableWrapperRef}>
          {loading ? (
            <div className="table-status-message">
              <div className="spinner-loader"></div>
              <span>Carregando dados...</span>
            </div>
          ) : inscritos.length === 0 ? (
            <div className="table-status-message">
              <span>Nenhum participante inscrito com os filtros aplicados.</span>
            </div>
          ) : (
            <>
              <table className="desktop-table">
                <thead>
                  <tr>
                    <th style={{ width: "50px", textAlign: "center" }}>
                      <input
                        type="checkbox"
                        className="table-checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Nome Completo</th>
                    <th>E-mail</th>
                    <th>Telefone</th>
                    <th>Localização</th>
                    <th>Graduação</th>
                    <th>CRMV</th>
                    <th>Modalidade</th>
                    <th>Data Cadastro</th>
                    <th style={{ textAlign: "center", width: "100px" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {inscritos.map((i) => (
                    <tr key={i.id_inscrito} className={selectedIds.has(i.id_inscrito) ? "row-selected" : ""}>
                      <td style={{ textAlign: "center" }}>
                        <input
                          type="checkbox"
                          className="table-checkbox"
                          checked={selectedIds.has(i.id_inscrito)}
                          onChange={() => handleSelectRow(i.id_inscrito)}
                        />
                      </td>
                      <td className="cell-highlight-text">
                        {i.nm_inscrito}
                      </td>
                      <td className="cell-email">{i.ds_email}</td>
                      <td>{i.nu_telefone}</td>
                      <td>
                        <span className="location-text">
                          {i.nm_cidade} <span className="country-sub">{i.nm_pais}</span>
                        </span>
                      </td>
                      <td>
                        {i.fl_graduado === 1 ? (
                          <span className="badge-graduado sim">
                            Sim <span className="degree-sub">({i.ds_curso_graduacao})</span>
                          </span>
                        ) : (
                          <span className="badge-graduado nao">Não</span>
                        )}
                      </td>
                      <td>{i.ds_crmv || <span className="text-empty-dash">-</span>}</td>
                      <td>
                        <span
                          className={`badge-modalidade ${
                            i.ds_modalidade === "Presencial"
                              ? "presencial"
                              : "online"
                          }`}
                        >
                          <span className="badge-dot"></span>
                          {i.ds_modalidade}
                        </span>
                      </td>
                      <td className="cell-date">
                        {new Date(i.dt_cadastro).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          className="btn-danger-icon"
                          title="Excluir Participante"
                          onClick={() =>
                            handleDelete(i.id_inscrito, i.nm_inscrito)
                          }
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mobile-cards-list">
                {inscritos.map((i) => (
                  <div key={i.id_inscrito} className={`mobile-inscrito-card ${selectedIds.has(i.id_inscrito) ? "card-selected" : ""}`}>
                    <div className="mobile-card-header">
                      <div className="mobile-card-header-left">
                        <input
                          type="checkbox"
                          className="table-checkbox"
                          checked={selectedIds.has(i.id_inscrito)}
                          onChange={() => handleSelectRow(i.id_inscrito)}
                        />
                        <span className="mobile-card-name">{i.nm_inscrito}</span>
                      </div>
                      <span
                        className={`badge-modalidade ${
                          i.ds_modalidade === "Presencial"
                            ? "presencial"
                            : "online"
                        }`}
                      >
                        <span className="badge-dot"></span>
                        {i.ds_modalidade}
                      </span>
                    </div>

                    <div className="mobile-card-body">
                      <div className="mobile-card-row">
                        <span className="row-label">E-mail:</span>
                        <span className="row-value cell-email">{i.ds_email}</span>
                      </div>
                      <div className="mobile-card-row">
                        <span className="row-label">Telefone:</span>
                        <span className="row-value">{i.nu_telefone}</span>
                      </div>
                      <div className="mobile-card-row">
                        <span className="row-label">Localização:</span>
                        <span className="row-value">
                          {i.nm_cidade} ({i.nm_pais})
                        </span>
                      </div>
                      <div className="mobile-card-row">
                        <span className="row-label">Graduado:</span>
                        <span className="row-value">
                          {i.fl_graduado === 1 ? (
                            <span className="badge-graduado sim">Sim <span className="degree-sub">({i.ds_curso_graduacao})</span></span>
                          ) : (
                            <span className="badge-graduado nao">Não</span>
                          )}
                        </span>
                      </div>
                      {i.ds_crmv && (
                        <div className="mobile-card-row">
                          <span className="row-label">CRMV:</span>
                          <span className="row-value">{i.ds_crmv}</span>
                        </div>
                      )}
                      <div className="mobile-card-row">
                        <span className="row-label">Como soube:</span>
                        <span className="row-value">{i.ds_como_soube}{i.ds_como_soube_outro ? ` (${i.ds_como_soube_outro})` : ""}</span>
                      </div>
                      <div className="mobile-card-row">
                        <span className="row-label">Cadastro:</span>
                        <span className="row-value cell-date">
                          {new Date(i.dt_cadastro).toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>

                    <div className="mobile-card-actions">
                      <button
                        className="btn-danger-outline btn-with-icon"
                        style={{ width: "100%", justifyContent: "center" }}
                        onClick={() => handleDelete(i.id_inscrito, i.nm_inscrito)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Excluir Registro
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
