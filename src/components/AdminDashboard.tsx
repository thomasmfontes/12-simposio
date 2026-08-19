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
  fl_comunicacoes_aceite?: number;
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
  initialTotalFiltered?: number;
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

interface BadgeModalidadeSelectProps {
  value: string;
  onChange: (newValue: string) => void;
  disabled?: boolean;
}

function BadgeModalidadeSelect({
  value,
  onChange,
  disabled,
}: BadgeModalidadeSelectProps) {
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

  const isPresencial = value === "Presencial";

  return (
    <div className="badge-modalidade-container" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        className={`badge-modalidade ${isPresencial ? "presencial" : "online"} ${
          isOpen ? "open" : ""
        }`}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        title="Alterar modalidade"
      >
        <span className="badge-dot"></span>
        <span className="badge-text">{value}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`badge-chevron ${isOpen ? "open" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="badge-modalidade-dropdown">
          <button
            type="button"
            className={`badge-modalidade-option ${
              value === "Presencial" ? "selected" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onChange("Presencial");
              setIsOpen(false);
            }}
          >
            <span className="badge-dot dot-presencial"></span>
            <span>Presencial</span>
          </button>

          <button
            type="button"
            className={`badge-modalidade-option ${
              value === "Online" ? "selected" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onChange("Online");
              setIsOpen(false);
            }}
          >
            <span className="badge-dot dot-online"></span>
            <span>Online</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard({
  initialInscritos,
  initialMetrics,
  initialCidades,
  initialTotalFiltered,
}: AdminDashboardProps) {
  // Estados para dados e filtros
  const [inscritos, setInscritos] = useState<InscritoData[]>(initialInscritos);
  const [metrics, setMetrics] = useState<Metrics>(initialMetrics);
  const [cidades, setCidades] = useState<string[]>(initialCidades);

  // Estados de Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const initialCount = initialTotalFiltered ?? initialMetrics.total ?? initialInscritos.length;
  const [totalFiltered, setTotalFiltered] = useState(initialCount);
  const [totalPages, setTotalPages] = useState(Math.max(1, Math.ceil(initialCount / 50)));

  const [filterSearch, setFilterSearch] = useState("");
  const [filterCidade, setFilterCidade] = useState("");
  const [filterModalidade, setFilterModalidade] = useState("");
  const [filterDataInicio, setFilterDataInicio] = useState("");
  const [filterDataFim, setFilterDataFim] = useState("");

  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingBadges, setIsGeneratingBadges] = useState(false);
  const [updatingModalidadeId, setUpdatingModalidadeId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [presencialLocked, setPresencialLocked] = useState(true);
  const tableWrapperRef = React.useRef<HTMLDivElement>(null);
  const isFirstRender = React.useRef(true);

  // Efeito para carregar o status de travamento das inscrições presenciais
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          if (typeof data.presencialLocked === "boolean") {
            setPresencialLocked(data.presencialLocked);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar configurações do admin:", err);
      }
    }
    fetchSettings();
  }, []);

  const handleToggleLock = async () => {
    const newLocked = !presencialLocked;
    setPresencialLocked(newLocked);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presencialLocked: newLocked }),
      });
      if (!res.ok) {
        setPresencialLocked(!newLocked);
        alert("Erro ao alterar o status das inscrições presenciais.");
      }
    } catch (err) {
      setPresencialLocked(!newLocked);
      console.error(err);
      alert("Erro ao conectar ao servidor.");
    }
  };

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
        target.closest("select") ||
        target.closest("a") ||
        target.closest(".custom-select-container") ||
        target.closest(".badge-modalidade-container") ||
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

  // Reseta para a primeira página ao alterar os filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filterSearch, filterCidade, filterModalidade, filterDataInicio, filterDataFim]);

  // Busca dados atualizados da API ao alterar filtros ou página (ignora a primeira renderização)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (filterSearch) queryParams.set("q", filterSearch);
        if (filterCidade) queryParams.set("cidade", filterCidade);
        if (filterModalidade) queryParams.set("modalidade", filterModalidade);
        if (filterDataInicio) queryParams.set("data_inicio", filterDataInicio);
        if (filterDataFim) queryParams.set("data_fim", filterDataFim);
        queryParams.set("page", String(currentPage));
        queryParams.set("limit", String(pageSize));

        const response = await fetch(
          `/api/admin/inscritos?${queryParams.toString()}`,
        );
        const result = await response.json();

        if (response.ok && result.success) {
          setInscritos(result.data);
          setMetrics(result.metrics);
          setCidades(result.cidades);
          setTotalFiltered(result.totalFiltered);
          setTotalPages(result.totalPages);
        }
      } catch (err) {
        console.error("Erro ao filtrar dados:", err);
      } finally {
        setLoading(false);
      }
    };

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
    currentPage,
    pageSize,
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

  // Alteração de Modalidade (Presencial <-> Online)
  const handleUpdateModalidade = async (
    id: number,
    currentModalidade: string,
    newModalidade: string,
  ) => {
    if (currentModalidade === newModalidade) return;

    setUpdatingModalidadeId(id);
    try {
      const response = await fetch("/api/admin/inscritos", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_inscrito: id,
          ds_modalidade: newModalidade,
        }),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        // Atualiza estado local dos inscritos
        setInscritos((prev) =>
          prev.map((i) =>
            i.id_inscrito === id ? { ...i, ds_modalidade: newModalidade } : i,
          ),
        );

        // Atualiza as estatísticas no topo da tela
        setMetrics((prev) => {
          const presencialDiff = newModalidade === "Presencial" ? 1 : -1;
          const onlineDiff = newModalidade === "Online" ? 1 : -1;
          return {
            ...prev,
            presencial: Math.max(0, prev.presencial + presencialDiff),
            online: Math.max(0, prev.online + onlineDiff),
          };
        });
      } else {
        alert(result.error || "Erro ao atualizar a modalidade.");
      }
    } catch (err) {
      console.error("Erro ao atualizar modalidade:", err);
      alert("Erro de conexão ao alterar a modalidade.");
    } finally {
      setUpdatingModalidadeId(null);
    }
  };


  // Busca todos os registros correspondentes aos filtros atuais (sem paginação) para exportar CSV ou PDF
  const fetchAllForAction = async (): Promise<InscritoData[]> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.set("all", "true");
      if (filterSearch) queryParams.set("q", filterSearch);
      if (filterCidade) queryParams.set("cidade", filterCidade);
      if (filterModalidade) queryParams.set("modalidade", filterModalidade);
      if (filterDataInicio) queryParams.set("data_inicio", filterDataInicio);
      if (filterDataFim) queryParams.set("data_fim", filterDataFim);

      const response = await fetch(
        `/api/admin/inscritos?${queryParams.toString()}`
      );
      const result = await response.json();
      if (response.ok && result.success) {
        return result.data;
      }
    } catch (err) {
      console.error("Erro ao buscar dados completos para exportação/crachás:", err);
    }
    return inscritos;
  };

  // Exportar para Excel/CSV usando separador ponto e vírgula e BOM (compatível com Excel PT-BR)
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const listToExport = await fetchAllForAction();
      if (listToExport.length === 0) {
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
        "Receber Comunicações",
        "Data Cadastro",
      ];

      const rows = listToExport.map((p) => [
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
        p.fl_comunicacoes_aceite === 1 ? "Sim" : "Não",
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
    } catch (err) {
      console.error("Erro ao exportar CSV:", err);
      alert("Erro ao exportar CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  // Gerar Crachás em PDF (8x4 cm = 80mm x 40mm)
  const handleGenerateBadges = async (onlySelected: boolean) => {
    setIsGeneratingBadges(true);
    try {
      const fullList = onlySelected ? inscritos : await fetchAllForAction();
      const listToGenerate = onlySelected
        ? fullList.filter((i) => selectedIds.has(i.id_inscrito))
        : fullList;

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
    } catch (err) {
      console.error("Erro ao gerar crachás:", err);
      alert("Erro ao gerar crachás.");
    } finally {
      setIsGeneratingBadges(false);
    }
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
        <div className="admin-actions" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            type="button"
            onClick={handleToggleLock}
            className="btn-outline"
            style={{
              background: presencialLocked ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)",
              borderColor: presencialLocked ? "#ef4444" : "#22c55e",
              color: presencialLocked ? "#f87171" : "#4ade80",
              fontWeight: 700,
              padding: "10px 18px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
              fontSize: "14px",
            }}
            title={presencialLocked ? "Clique para liberar vagas presenciais" : "Clique para travar vagas presenciais"}
          >
            {presencialLocked ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Presencial: TRAVADO</span>
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                </svg>
                <span>Presencial: ABERTO</span>
              </>
            )}
          </button>
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
            <span className="table-counter-badge">{totalFiltered}</span>
          </div>

          <div className="table-selection-actions">
            {/* Exportar CSV */}
            <button
              className="btn-outline btn-with-icon"
              onClick={handleExportCSV}
              disabled={isExporting || totalFiltered === 0}
            >
              {isExporting ? (
                <span className="spinner-loader-small"></span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              {isExporting ? "Exportando..." : "Exportar CSV"}
            </button>

            {/* Gerar Crachás dos Selecionados */}
            <button
              className="btn-primary btn-with-icon btn-badge-primary"
              onClick={() => handleGenerateBadges(true)}
              disabled={selectedIds.size === 0 || isGeneratingBadges}
            >
              {isGeneratingBadges ? (
                <span className="spinner-loader-small"></span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.333 0 4 .667 4 2v1H5v-1c0-1.333 2.667-2 4-2z" />
                </svg>
              )}
              Crachás Selecionados ({selectedIds.size})
            </button>

            {/* Gerar Crachás de Todos os Filtrados */}
            <button
              className="btn-outline btn-with-icon"
              onClick={() => handleGenerateBadges(false)}
              disabled={totalFiltered === 0 || isGeneratingBadges}
            >
              {isGeneratingBadges ? (
                <span className="spinner-loader-small"></span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              )}
              Crachás Todos ({totalFiltered})
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
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
                            <span className="badge-graduado sim">Sim</span>
                            {i.ds_curso_graduacao && (
                              <span className="degree-sub">{i.ds_curso_graduacao}</span>
                            )}
                          </div>
                        ) : (
                          <span className="badge-graduado nao">Não</span>
                        )}
                      </td>
                      <td>{i.ds_crmv || <span className="text-empty-dash">-</span>}</td>
                      <td>
                        {updatingModalidadeId === i.id_inscrito ? (
                          <span className="badge-modalidade loading">
                            <span className="spinner-loader-small"></span>
                            Salvando...
                          </span>
                        ) : (
                          <BadgeModalidadeSelect
                            value={i.ds_modalidade}
                            onChange={(newVal) =>
                              handleUpdateModalidade(
                                i.id_inscrito,
                                i.ds_modalidade,
                                newVal,
                              )
                            }
                            disabled={updatingModalidadeId === i.id_inscrito}
                          />
                        )}
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
                      {updatingModalidadeId === i.id_inscrito ? (
                        <span className="badge-modalidade loading">
                          <span className="spinner-loader-small"></span>
                          Salvando...
                        </span>
                      ) : (
                        <BadgeModalidadeSelect
                          value={i.ds_modalidade}
                          onChange={(newVal) =>
                            handleUpdateModalidade(
                              i.id_inscrito,
                              i.ds_modalidade,
                              newVal,
                            )
                          }
                          disabled={updatingModalidadeId === i.id_inscrito}
                        />
                      )}
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
                      <div className="mobile-card-row" style={{ alignItems: "flex-start" }}>
                        <span className="row-label" style={{ marginTop: "4px" }}>Graduado:</span>
                        <span className="row-value" style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
                          {i.fl_graduado === 1 ? (
                            <>
                              <span className="badge-graduado sim">Sim</span>
                              {i.ds_curso_graduacao && (
                                <span className="degree-sub" style={{ textAlign: "right" }}>{i.ds_curso_graduacao}</span>
                              )}
                            </>
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

        {/* Barra de Paginação */}
        {totalFiltered > 0 && (
          <div
            className="pagination-bar"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              padding: "18px 24px",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              background: "linear-gradient(180deg, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)",
              borderRadius: "0 0 16px 16px",
            }}
          >
            <div style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500 }}>
              Exibindo{" "}
              <strong style={{ color: "#ffffff", fontWeight: 700 }}>
                {totalFiltered > 0 ? (currentPage - 1) * pageSize + 1 : 0} – {Math.min(currentPage * pageSize, totalFiltered)}
              </strong>{" "}
              de <strong style={{ color: "#ffffff", fontWeight: 700 }}>{totalFiltered}</strong> inscritos
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500 }}>
                  Por página:
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{
                    background: "rgba(30, 41, 59, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#ffffff",
                    padding: "6px 12px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  disabled={currentPage === 1 || loading}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    if (tableWrapperRef.current) {
                      tableWrapperRef.current.scrollTop = 0;
                    }
                  }}
                  className="btn-outline"
                  style={{
                    padding: "7px 16px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: currentPage === 1 || loading ? "not-allowed" : "pointer",
                    opacity: currentPage === 1 || loading ? 0.35 : 1,
                    transition: "all 0.2s ease",
                  }}
                >
                  Anterior
                </button>

                <div
                  style={{
                    padding: "6px 14px",
                    borderRadius: "20px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    fontSize: "13px",
                    color: "#94a3b8",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>Página</span>
                  <strong style={{ color: "#38bdf8", fontWeight: 700 }}>{currentPage}</strong>
                  <span>de</span>
                  <strong style={{ color: "#ffffff", fontWeight: 600 }}>{totalPages}</strong>
                </div>

                <button
                  disabled={currentPage >= totalPages || loading}
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    if (tableWrapperRef.current) {
                      tableWrapperRef.current.scrollTop = 0;
                    }
                  }}
                  className="btn-outline"
                  style={{
                    padding: "7px 16px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: currentPage >= totalPages || loading ? "not-allowed" : "pointer",
                    opacity: currentPage >= totalPages || loading ? 0.35 : 1,
                    transition: "all 0.2s ease",
                  }}
                >
                  Próximo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
