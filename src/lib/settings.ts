import db from "@/lib/db";

// Estado em memória (padrão: true = presencial travado/esgotado)
let memoryPresencialLocked = true;

/**
 * Retorna se as inscrições para a modalidade Presencial estão travadas.
 * Verifica as chaves 'presencial_locked' e 'registration_locked' na tabela `t_config`.
 * Se a tabela não existir, estiver vazia ou ocorrer erro, utiliza o padrão true (travado).
 */
export async function isPresencialLocked(): Promise<boolean> {
  try {
    const { data, error } = await db
      .from("t_config")
      .select("key, value")
      .in("key", ["presencial_locked", "registration_locked"]);

    if (error || !data || data.length === 0) {
      return memoryPresencialLocked;
    }

    const presencialRow = data.find((r) => r.key === "presencial_locked");
    if (presencialRow) {
      return (
        presencialRow.value === "true" ||
        presencialRow.value === true ||
        presencialRow.value === "1"
      );
    }

    const regRow = data.find((r) => r.key === "registration_locked");
    if (regRow) {
      return (
        regRow.value === "true" ||
        regRow.value === true ||
        regRow.value === "1"
      );
    }

    return memoryPresencialLocked;
  } catch (err) {
    console.warn("Erro ao consultar t_config, usando estado em memória:", err);
    return memoryPresencialLocked;
  }
}

/**
 * Atualiza o status de bloqueio das inscrições presenciais.
 */
export async function setPresencialLocked(locked: boolean): Promise<boolean> {
  memoryPresencialLocked = locked;
  const strVal = locked ? "true" : "false";

  try {
    // Atualiza ambas as chaves para sincronizar t_config
    await Promise.all([
      db
        .from("t_config")
        .upsert({ key: "presencial_locked", value: strVal }, { onConflict: "key" }),
      db
        .from("t_config")
        .upsert({ key: "registration_locked", value: strVal }, { onConflict: "key" }),
    ]);
  } catch (err) {
    console.warn("Erro ao salvar em t_config:", err);
  }

  return memoryPresencialLocked;
}
