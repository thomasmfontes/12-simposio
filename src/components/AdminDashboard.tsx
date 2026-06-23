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
    <div className="container" style={{ animation: "fadeIn 0.3s ease-out" }}>
      {/* Cabeçalho */}
      <div className="admin-header">
        <div className="admin-header-title">
          <h1>Painel Administrativo</h1>
          <p>Gerenciamento de inscritos no 12º Simpósio</p>
        </div>
        <div className="admin-actions">
          <button className="btn-outline" onClick={handleLogout}>
            Sair do Painel
          </button>
        </div>
      </div>

      {/* Grid de Métricas Gerais */}
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-title">Geral Inscritos</span>
          <span className="metric-value">{metrics.total}</span>
          <span className="metric-subtitle">Total geral de cadastros</span>
        </div>
        <div
          className="metric-card"
          style={{ borderLeft: "4px solid #10b981" }}
        >
          <span className="metric-title">Presencial</span>
          <span className="metric-value" style={{ color: "#10b981" }}>
            {metrics.presencial}
          </span>
          <span className="metric-subtitle">
            Presenças confirmadas no local
          </span>
        </div>
        <div
          className="metric-card"
          style={{ borderLeft: "4px solid #3b82f6" }}
        >
          <span className="metric-title">Online</span>
          <span className="metric-value" style={{ color: "#3b82f6" }}>
            {metrics.online}
          </span>
          <span className="metric-subtitle">Visualizações por streaming</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-card">
        <div className="filters-grid">
          {/* Busca por Nome/Email */}
          <div className="input-field-wrapper">
            <label>Busca Textual</label>
            <input
              type="text"
              className="input-field"
              placeholder="Nome ou E-mail..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
            />
          </div>

          {/* Filtro Cidade */}
          <div className="input-field-wrapper">
            <label>Cidade</label>
            <select
              className="input-field"
              value={filterCidade}
              onChange={(e) => setFilterCidade(e.target.value)}
              style={{ appearance: "auto" }}
            >
              <option value="">Todas as cidades</option>
              {cidades.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Modalidade */}
          <div className="input-field-wrapper">
            <label>Modalidade</label>
            <select
              className="input-field"
              value={filterModalidade}
              onChange={(e) => setFilterModalidade(e.target.value)}
              style={{ appearance: "auto" }}
            >
              <option value="">Todas</option>
              <option value="Presencial">Presencial</option>
              <option value="Online">Online</option>
            </select>
          </div>

          {/* Filtro Período de Inscrição */}
          <div className="input-field-wrapper">
            <label>Período de Inscrição</label>
            <div className="date-range-inputs">
              <input
                type="date"
                className="input-field"
                value={filterDataInicio}
                onChange={(e) => setFilterDataInicio(e.target.value)}
              />
              <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                até
              </span>
              <input
                type="date"
                className="input-field"
                value={filterDataFim}
                onChange={(e) => setFilterDataFim(e.target.value)}
              />
            </div>
          </div>
        </div>

        {(filterSearch ||
          filterCidade ||
          filterModalidade ||
          filterDataInicio ||
          filterDataFim) && (
          <div
            style={{
              marginTop: "16px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
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
            Lista de Inscritos ({inscritos.length} exibidos)
          </div>

          <div className="table-selection-actions">
            {selectedIds.size > 0 && (
              <span
                style={{
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  marginRight: "8px",
                }}
              >
                {selectedIds.size} selecionado(s)
              </span>
            )}

            {/* Exportar CSV */}
            <button className="btn-outline" onClick={handleExportCSV}>
              Exportar CSV
            </button>

            {/* Gerar Crachás dos Selecionados */}
            <button
              className="btn-primary"
              onClick={() => handleGenerateBadges(true)}
              disabled={selectedIds.size === 0}
              style={{ opacity: selectedIds.size === 0 ? 0.6 : 1 }}
            >
              Crachás Selecionados ({selectedIds.size})
            </button>

            {/* Gerar Crachás de Todos os Filtrados */}
            <button
              className="btn-outline"
              onClick={() => handleGenerateBadges(false)}
              disabled={inscritos.length === 0}
            >
              Crachás Todos ({inscritos.length})
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              Carregando dados...
            </div>
          ) : inscritos.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              Nenhum participante inscrito com os filtros aplicados.
            </div>
          ) : (
            <>
              <table className="desktop-table">
                <thead>
                  <tr>
                    <th style={{ width: "40px", textAlign: "center" }}>
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
                    <th style={{ textAlign: "center" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {inscritos.map((i) => (
                    <tr key={i.id_inscrito}>
                      <td style={{ textAlign: "center" }}>
                        <input
                          type="checkbox"
                          className="table-checkbox"
                          checked={selectedIds.has(i.id_inscrito)}
                          onChange={() => handleSelectRow(i.id_inscrito)}
                        />
                      </td>
                      <td style={{ fontWeight: "600", color: "#ffffff" }}>
                        {i.nm_inscrito}
                      </td>
                      <td>{i.ds_email}</td>
                      <td>{i.nu_telefone}</td>
                      <td>
                        {i.nm_cidade} ({i.nm_pais})
                      </td>
                      <td>
                        {i.fl_graduado === 1 ? (
                          <span className="badge-graduado sim">
                            Sim ({i.ds_curso_graduacao})
                          </span>
                        ) : (
                          <span className="badge-graduado">Não</span>
                        )}
                      </td>
                      <td>{i.ds_crmv || "-"}</td>
                      <td>
                        <span
                          className={`badge-modalidade ${
                            i.ds_modalidade === "Presencial"
                              ? "presencial"
                              : "online"
                          }`}
                        >
                          {i.ds_modalidade}
                        </span>
                      </td>
                      <td
                        style={{ fontSize: "13px", color: "var(--text-muted)" }}
                      >
                        {new Date(i.dt_cadastro).toLocaleString("pt-BR")}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          className="btn-danger-outline"
                          onClick={() =>
                            handleDelete(i.id_inscrito, i.nm_inscrito)
                          }
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mobile-cards-list">
                {inscritos.map((i) => (
                  <div key={i.id_inscrito} className="mobile-inscrito-card">
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
                        {i.ds_modalidade}
                      </span>
                    </div>

                    <div className="mobile-card-body">
                      <div className="mobile-card-row">
                        <span className="row-label">E-mail:</span>
                        <span className="row-value">{i.ds_email}</span>
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
                          {i.fl_graduado === 1 ? `Sim (${i.ds_curso_graduacao})` : "Não"}
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
                        <span className="row-value">
                          {new Date(i.dt_cadastro).toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>

                    <div className="mobile-card-actions">
                      <button
                        className="btn-danger-outline"
                        style={{ width: "100%" }}
                        onClick={() => handleDelete(i.id_inscrito, i.nm_inscrito)}
                      >
                        Excluir
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
