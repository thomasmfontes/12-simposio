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
    let queryBuilder = db
      .from("t_inscritos")
      .select("*");

    if (q.trim()) {
      queryBuilder = queryBuilder.or(`nm_inscrito.ilike.%${q.trim()}%,ds_email.ilike.%${q.trim()}%`);
    }

    if (cidade.trim()) {
      queryBuilder = queryBuilder.eq("nm_cidade", cidade.trim());
    }

    if (modalidade.trim()) {
      queryBuilder = queryBuilder.eq("ds_modalidade", modalidade.trim());
    }

    if (dataInicio) {
      queryBuilder = queryBuilder.gte("dt_cadastro", `${dataInicio}T00:00:00.000Z`);
    }

    if (dataFim) {
      queryBuilder = queryBuilder.lte("dt_cadastro", `${dataFim}T23:59:59.999Z`);
    }

    // Ordena do mais recente para o mais antigo
    queryBuilder = queryBuilder.order("dt_cadastro", { ascending: false });

    const { data: inscritos, error: fetchError } = await queryBuilder;
    if (fetchError) {
      console.error("Erro ao buscar inscritos no Supabase:", fetchError);
      throw fetchError;
    }

    // 3. Estatísticas Gerais (não afetadas pelos filtros da tabela)
    const [totalRes, presencialRes, onlineRes] = await Promise.all([
      db.from("t_inscritos").select("*", { count: "exact", head: true }),
      db.from("t_inscritos").select("*", { count: "exact", head: true }).eq("ds_modalidade", "Presencial"),
      db.from("t_inscritos").select("*", { count: "exact", head: true }).eq("ds_modalidade", "Online"),
    ]);

    if (totalRes.error) throw totalRes.error;
    if (presencialRes.error) throw presencialRes.error;
    if (onlineRes.error) throw onlineRes.error;

    const totalCount = totalRes.count || 0;
    const presencialCount = presencialRes.count || 0;
    const onlineCount = onlineRes.count || 0;

    // 4. Lista de cidades distintas para preencher o filtro do painel
    const { data: allCities, error: citiesError } = await db
      .from("t_inscritos")
      .select("nm_cidade");

    if (citiesError) {
      console.error("Erro ao buscar lista de cidades no Supabase:", citiesError);
      throw citiesError;
    }

    const cidades = Array.from(
      new Set((allCities || []).map((c: { nm_cidade: string }) => c.nm_cidade))
    ).sort();

    return NextResponse.json({
      success: true,
      data: inscritos,
      metrics: {
        total: totalCount,
        presencial: presencialCount,
        online: onlineCount,
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

    const { error: deleteError, count } = await db
      .from("t_inscritos")
      .delete({ count: "exact" })
      .eq("id_inscrito", parseInt(id, 10));

    if (deleteError) {
      console.error("Erro ao excluir inscrito no Supabase:", deleteError);
      throw deleteError;
    }

    if (count === 0) {
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
