import { cookies } from "next/headers";
import crypto from "crypto";

// Cria um secret único em memória a cada reinicialização para assinar tokens temporários
const SESSION_SECRET =
  process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");

export async function getSessionToken(username: string): Promise<string> {
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(username)
    .digest("hex");
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return false;

  const expectedUser = process.env.ADMIN_USER || "admin";
  const expectedToken = await getSessionToken(expectedUser);
  return token === expectedToken;
}
