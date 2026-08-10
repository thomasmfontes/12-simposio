import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { isPresencialLocked, setPresencialLocked } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const locked = await isPresencialLocked();
  return NextResponse.json({ success: true, presencialLocked: locked });
}

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { presencialLocked } = body;

    if (typeof presencialLocked !== "boolean") {
      return NextResponse.json(
        { error: "O campo presencialLocked deve ser booleano." },
        { status: 400 }
      );
    }

    const updated = await setPresencialLocked(presencialLocked);
    return NextResponse.json({
      success: true,
      presencialLocked: updated,
      message: updated
        ? "Inscrições presenciais travadas com sucesso."
        : "Inscrições presenciais liberadas com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao atualizar configurações admin:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor ao atualizar configurações." },
      { status: 500 }
    );
  }
}
