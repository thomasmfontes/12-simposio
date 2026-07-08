import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { count, error } = await db
      .from("t_inscritos")
      .select("id_inscrito", { count: "exact", head: true })
      .eq("ds_modalidade", "Presencial");

    if (error) {
      console.error("Erro ao verificar capacidade presencial:", error);
      return NextResponse.json(
        { error: "Erro ao consultar capacidade." },
        { status: 500 }
      );
    }

    const currentCount = count || 0;
    const isFull = currentCount >= 500;

    return NextResponse.json({
      success: true,
      presencialFull: isFull,
      count: currentCount,
      limit: 500,
    });
  } catch (error) {
    console.error("Erro interno na rota check-capacity:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
