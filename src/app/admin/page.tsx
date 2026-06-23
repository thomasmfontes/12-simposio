import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import db from "@/lib/db";
import AdminDashboard, { InscritoData } from "@/components/AdminDashboard";

export default async function AdminPage() {
  // 1. Bloqueia acesso caso não esteja autenticado no servidor
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  // 2. Consulta as métricas iniciais, inscritos e cidades em paralelo
  const [totalRes, presencialRes, onlineRes, inscritosRes, citiesRes] = await Promise.all([
    db.from("t_inscritos").select("*", { count: "exact", head: true }),
    db.from("t_inscritos").select("*", { count: "exact", head: true }).eq("ds_modalidade", "Presencial"),
    db.from("t_inscritos").select("*", { count: "exact", head: true }).eq("ds_modalidade", "Online"),
    db.from("t_inscritos").select("*").order("dt_cadastro", { ascending: false }),
    db.from("t_inscritos").select("nm_cidade"),
  ]);

  const initialMetrics = {
    total: totalRes.count || 0,
    presencial: presencialRes.count || 0,
    online: onlineRes.count || 0,
  };

  // 3. Consulta a lista inicial completa de inscritos
  const initialInscritos = (inscritosRes.data || []) as InscritoData[];

  // 4. Carrega a lista de cidades únicas registradas para o filtro
  const initialCidades = Array.from(
    new Set((citiesRes.data || []).map((c: { nm_cidade: string }) => c.nm_cidade))
  ).sort();

  return (
    <div className="admin-layout">
      <AdminDashboard
        initialInscritos={initialInscritos}
        initialMetrics={initialMetrics}
        initialCidades={initialCidades}
      />
    </div>
  );
}
