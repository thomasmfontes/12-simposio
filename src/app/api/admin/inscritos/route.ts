import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(request: Request) {
  // 1. Autenticação do Administrador
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const cidade = searchParams.get("cidade") || "";
  const modalidade = searchParams.get("modalidade") || "";
  const dataInicio = searchParams.get("data_inicio") || "";
  const dataFim = searchParams.get("data_fim") || "";

  try {
    // 2. Monta query dinâmica de busca
    let query = "SELECT * FROM t_inscritos WHERE 1=1";
    const params: string[] = [];

    if (q.trim()) {
      query += " AND (nm_inscrito LIKE ? OR ds_email LIKE ?)";
      params.push(`%${q.trim()}%`, `%${q.trim()}%`);
    }

    if (cidade.trim()) {
      query += " AND nm_cidade = ?";
      params.push(cidade.trim());
    }

    if (modalidade.trim()) {
      query += " AND ds_modalidade = ?";
      params.push(modalidade.trim());
    }

    if (dataInicio) {
      query += " AND dt_cadastro >= ?";
      params.push(`${dataInicio}T00:00:00.000Z`);
    }

    if (dataFim) {
      query += " AND dt_cadastro <= ?";
      params.push(`${dataFim}T23:59:59.999Z`);
    }

    // Ordena do mais recente para o mais antigo
    query += " ORDER BY dt_cadastro DESC";

    const stmt = db.prepare(query);
    const inscritos = stmt.all(...params);

    // 3. Estatísticas Gerais (não afetadas pelos filtros da tabela)
    const totalCount = db
      .prepare("SELECT COUNT(*) as count FROM t_inscritos")
      .get() as { count: number };
    const presencialCount = db
      .prepare(
        "SELECT COUNT(*) as count FROM t_inscritos WHERE ds_modalidade = 'Presencial'",
      )
      .get() as { count: number };
    const onlineCount = db
      .prepare(
        "SELECT COUNT(*) as count FROM t_inscritos WHERE ds_modalidade = 'Online'",
      )
      .get() as { count: number };

    // 4. Lista de cidades distintas para preencher o filtro do painel
    const citiesList = db
      .prepare(
        "SELECT DISTINCT nm_cidade FROM t_inscritos ORDER BY nm_cidade ASC",
      )
      .all() as { nm_cidade: string }[];
    const cidades = citiesList.map((c) => c.nm_cidade);

    return NextResponse.json({
      success: true,
      data: inscritos,
      metrics: {
        total: totalCount?.count || 0,
        presencial: presencialCount?.count || 0,
        online: onlineCount?.count || 0,
      },
      cidades,
    });
  } catch (error) {
    console.error("Erro ao carregar inscritos no painel:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor ao carregar dados dos participantes.",
      },
      { status: 500 },
    );
  }
}

// Endpoint opcional para deletar participantes (facilitando limpeza de dados de teste)
export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }

    const deleteStmt = db.prepare(
      "DELETE FROM t_inscritos WHERE id_inscrito = ?",
    );
    const result = deleteStmt.run(id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Inscrito não encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Participante excluído com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao excluir inscrito:", error);
    return NextResponse.json(
      { error: "Erro ao processar exclusão." },
      { status: 500 },
    );
  }
}
