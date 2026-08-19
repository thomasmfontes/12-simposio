import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import db from "@/lib/db";
import AdminDashboard, { InscritoData } from "@/components/AdminDashboard";

export default async function AdminPage() {
  // 1. Bloqueia acesso caso não esteja autenticado no servidor
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  // 2. Consulta as métricas iniciais e os inscritos da 1ª página (50 itens)
  const [totalRes, presencialRes, onlineRes, inscritosRes] = await Promise.all([
    db.from("t_inscritos").select("*", { count: "exact", head: true }),
    db.from("t_inscritos").select("*", { count: "exact", head: true }).eq("ds_modalidade", "Presencial"),
    db.from("t_inscritos").select("*", { count: "exact", head: true }).eq("ds_modalidade", "Online"),
    db.from("t_inscritos").select("*").order("dt_cadastro", { ascending: false }).range(0, 49),
  ]);

  const totalCount = totalRes.count || 0;
  const initialMetrics = {
    total: totalCount,
    presencial: presencialRes.count || 0,
    online: onlineRes.count || 0,
  };

  // 3. Consulta a lista inicial da primeira página de inscritos
  const initialInscritos = (inscritosRes.data || []) as InscritoData[];

  // 4. Carrega a lista de todas as cidades em lotes para garantir 100% de cobertura
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
    if (res.data) allCities.push(...res.data);
  }

  const initialCidades = Array.from(
    new Set(allCities.map((c) => c.nm_cidade).filter(Boolean))
  ).sort();

  return (
    <div className="admin-layout">
      <AdminDashboard
        initialInscritos={initialInscritos}
        initialMetrics={initialMetrics}
        initialCidades={initialCidades}
        initialTotalFiltered={totalCount}
      />
    </div>
  );
}
