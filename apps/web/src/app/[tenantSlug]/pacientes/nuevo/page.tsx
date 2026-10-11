import { RegisterPatientForm } from "./register-patient-form";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function NewPatientPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  if (tenantSlug !== "demo") redirect("/");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  return <main className="patient-page"><a className="back-link" href="/">← Volver al inicio</a><p className="eyebrow">FASE 1A · RECEPCIÓN</p><h1>Registrar tutor y mascota</h1><p className="page-intro">Sesión activa para la Clínica Demo. Cada registro queda aislado por tenant desde la base de datos.</p><RegisterPatientForm /></main>;
}
