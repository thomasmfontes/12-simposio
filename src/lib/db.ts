import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

if ((!process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.SUPABASE_URL) || (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
  console.warn("Warning: Supabase credentials are not set. Database queries will fail at runtime.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Inscrito {
  id_inscrito?: number;
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

export default supabase;
