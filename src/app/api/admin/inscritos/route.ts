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

  const isAll = searchParams.get("all") === "true";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, parseInt(searchParams.get("limit") || "50", 10));

  try {
    // 2. Monta query dinâmica de busca para dados e para contagem exata dos filtrados
    let queryBuilder = db.from("t_inscritos").select("*");
    let countQuery = db.from("t_inscritos").select("*", { count: "exact", head: true });

    if (q.trim()) {
      const filterStr = `nm_inscrito.ilike.%${q.trim()}%,ds_email.ilike.%${q.trim()}%`;
      queryBuilder = queryBuilder.or(filterStr);
      countQuery = countQuery.or(filterStr);
    }

    if (cidade.trim()) {
      queryBuilder = queryBuilder.eq("nm_cidade", cidade.trim());
      countQuery = countQuery.eq("nm_cidade", cidade.trim());
    }

    if (modalidade.trim()) {
      queryBuilder = queryBuilder.eq("ds_modalidade", modalidade.trim());
      countQuery = countQuery.eq("ds_modalidade", modalidade.trim());
    }

    if (dataInicio) {
      const gteVal = `${dataInicio}T00:00:00.000Z`;
      queryBuilder = queryBuilder.gte("dt_cadastro", gteVal);
      countQuery = countQuery.gte("dt_cadastro", gteVal);
    }

    if (dataFim) {
      const lteVal = `${dataFim}T23:59:59.999Z`;
      queryBuilder = queryBuilder.lte("dt_cadastro", lteVal);
      countQuery = countQuery.lte("dt_cadastro", lteVal);
    }

    // 3. Contagem exata dos filtrados e estatísticas gerais
    const [{ count: filteredCount, error: countFilteredError }, totalRes, presencialRes, onlineRes] =
      await Promise.all([
        countQuery,
        db.from("t_inscritos").select("*", { count: "exact", head: true }),
        db.from("t_inscritos").select("*", { count: "exact", head: true }).eq("ds_modalidade", "Presencial"),
        db.from("t_inscritos").select("*", { count: "exact", head: true }).eq("ds_modalidade", "Online"),
      ]);

    if (countFilteredError) {
      console.error("Erro ao contar inscritos filtrados no Supabase:", countFilteredError);
      throw countFilteredError;
    }
    if (totalRes.error) throw totalRes.error;
    if (presencialRes.error) throw presencialRes.error;
    if (onlineRes.error) throw onlineRes.error;

    const totalCount = totalRes.count || 0;
    const presencialCount = presencialRes.count || 0;
    const onlineCount = onlineRes.count || 0;
    const totalFiltered = filteredCount || 0;

    // 4. Busca de dados (paginada ou completa em lotes/chunks para contornar o limite de 1000 do Supabase)
    let inscritos: any[] = [];

    if (isAll) {
      if (totalFiltered > 0) {
        const CHUNK_SIZE = 1000;
        const totalChunks = Math.ceil(totalFiltered / CHUNK_SIZE);
        const chunkPromises = [];

        for (let i = 0; i < totalChunks; i++) {
          const from = i * CHUNK_SIZE;
          const to = from + CHUNK_SIZE - 1;

          let chunkQuery = db.from("t_inscritos").select("*");
          if (q.trim()) {
            const filterStr = `nm_inscrito.ilike.%${q.trim()}%,ds_email.ilike.%${q.trim()}%`;
            chunkQuery = chunkQuery.or(filterStr);
          }
          if (cidade.trim()) {
            chunkQuery = chunkQuery.eq("nm_cidade", cidade.trim());
          }
          if (modalidade.trim()) {
            chunkQuery = chunkQuery.eq("ds_modalidade", modalidade.trim());
          }
          if (dataInicio) {
            const gteVal = `${dataInicio}T00:00:00.000Z`;
            chunkQuery = chunkQuery.gte("dt_cadastro", gteVal);
          }
          if (dataFim) {
            const lteVal = `${dataFim}T23:59:59.999Z`;
            chunkQuery = chunkQuery.lte("dt_cadastro", lteVal);
          }

          chunkPromises.push(
            chunkQuery.order("dt_cadastro", { ascending: false }).range(from, to)
          );
        }

        const chunkResults = await Promise.all(chunkPromises);
        for (const res of chunkResults) {
          if (res.error) throw res.error;
          if (res.data) inscritos.push(...res.data);
        }
      }
    } else {
      const offset = (page - 1) * limit;
      const { data: pageData, error: pageError } = await queryBuilder
        .order("dt_cadastro", { ascending: false })
        .range(offset, offset + limit - 1);

      if (pageError) throw pageError;
      inscritos = pageData || [];
    }

    const totalPages = isAll ? 1 : Math.max(1, Math.ceil(totalFiltered / limit));

    // 5. Lista de cidades distintas buscando todos os registros em lotes se necessário
    const cityChunks = Math.ceil(totalCount / 1000) || 1;
    const cityPromises = [];
    for (let i = 0; i < cityChunks; i++) {
      cityPromises.push(
        db
          .from("t_inscritos")
          .select("nm_cidade")
          .range(i * 1000, (i + 1) * 1000 - 1)
      );
    }
    const cityResults = await Promise.all(cityPromises);
    const allCities: { nm_cidade: string }[] = [];
    for (const res of cityResults) {
      if (res.error) throw res.error;
      if (res.data) allCities.push(...res.data);
    }

    const cidades = Array.from(
      new Set(allCities.map((c) => c.nm_cidade).filter(Boolean))
    ).sort();

    return NextResponse.json({
      success: true,
      data: inscritos,
      totalFiltered,
      page: isAll ? 1 : page,
      limit: isAll ? totalFiltered : limit,
      totalPages,
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

// Endpoint para atualizar a modalidade de um participante (Presencial <-> Online)
export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id_inscrito, ds_modalidade } = body;

    if (!id_inscrito || !ds_modalidade) {
      return NextResponse.json(
        { error: "ID do inscrito e nova modalidade são obrigatórios." },
        { status: 400 },
      );
    }

    if (ds_modalidade !== "Presencial" && ds_modalidade !== "Online") {
      return NextResponse.json(
        { error: "Modalidade inválida. Escolha 'Presencial' ou 'Online'." },
        { status: 400 },
      );
    }

    const { error: updateError, data } = await db
      .from("t_inscritos")
      .update({ ds_modalidade })
      .eq("id_inscrito", id_inscrito)
      .select();

    if (updateError) {
      console.error("Erro ao atualizar modalidade no Supabase:", updateError);
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: "Modalidade atualizada com sucesso.",
      data,
    });
  } catch (error) {
    console.error("Erro ao atualizar modalidade:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar modalidade." },
      { status: 500 },
    );
  }
}
