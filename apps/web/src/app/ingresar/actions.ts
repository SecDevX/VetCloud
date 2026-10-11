"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SignInState = { status: "idle" | "error"; message?: string };

export async function signIn(_: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { status: "error", message: "Ingresa tu correo y contraseña." };

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { status: "error", message: "Correo o contraseña incorrectos." };
  } catch {
    return { status: "error", message: "No se pudo iniciar sesión. Intenta nuevamente." };
  }

  redirect("/demo/pacientes/nuevo");
}
