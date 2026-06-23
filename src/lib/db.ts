import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.db");
const db = new Database(dbPath);

// Configura modo WAL para melhor concorrência e escrita
db.pragma("journal_mode = WAL");

// Inicializa a tabela caso não exista
db.exec(`
  CREATE TABLE IF NOT EXISTS t_inscritos (
    id_inscrito INTEGER PRIMARY KEY AUTOINCREMENT,
    nm_inscrito TEXT NOT NULL,
    dt_nascimento TEXT NOT NULL,
    ds_email TEXT NOT NULL UNIQUE,
    nu_telefone TEXT NOT NULL,
    nm_pais TEXT NOT NULL,
    nm_cidade TEXT NOT NULL,
    fl_graduado INTEGER NOT NULL, -- 1 = Sim, 0 = Não
    ds_curso_graduacao TEXT,
    ds_crmv TEXT,
    ds_como_soube TEXT NOT NULL,
    ds_como_soube_outro TEXT,
    ds_modalidade TEXT NOT NULL, -- Presencial / Online
    fl_lgpd_aceite INTEGER NOT NULL, -- 1 = Sim
    dt_cadastro TEXT NOT NULL
  );
`);

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

export default db;
