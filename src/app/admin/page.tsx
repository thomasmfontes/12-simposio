import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import db from "@/lib/db";
import AdminDashboard, { InscritoData } from "@/components/AdminDashboard";

export default async function AdminPage() {
  // 1. Bloqueia acesso caso não esteja autenticado no servidor
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  // 2. Consulta as métricas iniciais
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

  const initialMetrics = {
    total: totalCount?.count || 0,
    presencial: presencialCount?.count || 0,
    online: onlineCount?.count || 0,
  };

  // 3. Consulta a lista inicial completa de inscritos (ordenado por cadastro mais recente)
  const initialInscritos = db
    .prepare("SELECT * FROM t_inscritos ORDER BY dt_cadastro DESC")
    .all() as InscritoData[];

  // 4. Carrega a lista de cidades únicas registradas para o filtro
  const citiesList = db
    .prepare(
      "SELECT DISTINCT nm_cidade FROM t_inscritos ORDER BY nm_cidade ASC",
    )
    .all() as { nm_cidade: string }[];
  const initialCidades = citiesList.map((c) => c.nm_cidade);

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
