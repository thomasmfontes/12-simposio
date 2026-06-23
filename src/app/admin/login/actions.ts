"use server";

import { cookies } from "next/headers";
import { getSessionToken } from "@/lib/auth";

export async function loginAdmin(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const expectedUser = process.env.ADMIN_USER || "admin";
  const expectedPass = process.env.ADMIN_PASS || "admin123";

  if (username === expectedUser && password === expectedPass) {
    const token = await getSessionToken(username);
    const cookieStore = await cookies();

    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 dia de validade
      path: "/",
    });

    return { success: true };
  }

  return { success: false, error: "Usuário ou senha incorretos." };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return { success: true };
}
