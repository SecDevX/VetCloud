import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PatientRow = {
  guardian_id: string;
  guardian_name: string;
  document_number: string | null;
  phone: string | null;
  email: string | null;
  pet_id: string;
  pet_name: string;
  species: string;
  pet_status: string;
  microchip: string | null;
};

const speciesLabel: Record<string, string> = {
  dog: "Perro", cat: "Gato", bird: "Ave", exotic: "Exótico", other: "Otro",
};

export default async function PatientsPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ buscar?: string }>;
}) {
  const [{ tenantSlug }, { buscar }] = await Promise.all([params, searchParams]);
  if (tenantSlug !== "demo") redirect("/");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const query = buscar?.trim().slice(0, 100) ?? "";
  const { data, error } = await supabase.schema("clients").rpc("search_patients", {
    p_query: query || null,
    p_limit: 50,
  });
  const patients = (data ?? []) as PatientRow[];

  return (
    <main className="patient-page">
      <div className="page-actions">
        <Link className="back-link" href="/">← Inicio</Link>
        <Link className="button primary" href="/demo/pacientes/nuevo">Registrar paciente</Link>
      </div>
      <p className="eyebrow">FASE 1A · RECEPCIÓN</p>
      <h1>Pacientes</h1>
      <p className="page-intro">Busca por nombre del tutor o mascota, documento, teléfono, correo o microchip. Los resultados pertenecen únicamente a la Clínica Demo.</p>

      <form className="patient-search" action="/demo/pacientes" method="get">
        <label htmlFor="buscar">Buscar paciente</label>
        <div><input id="buscar" name="buscar" defaultValue={query} placeholder="Ej. Luna, María, DNI o microchip" /><button type="submit">Buscar</button></div>
      </form>

      {error ? (
        <p className="form-message error" role="alert">No se pudo cargar el listado. Actualiza la página e intenta nuevamente.</p>
      ) : patients.length === 0 ? (
        <section className="empty-state"><h2>{query ? "Sin resultados" : "Aún no hay pacientes"}</h2><p>{query ? "Prueba con otro dato de búsqueda." : "Registra el primer tutor y mascota para verlo aquí."}</p><Link className="button primary" href="/demo/pacientes/nuevo">Registrar paciente</Link></section>
      ) : (
        <section className="patient-list" aria-label="Resultados de pacientes">
          <p className="result-count">{patients.length} {patients.length === 1 ? "resultado" : "resultados"}{query ? ` para “${query}”` : ""}</p>
          {patients.map((patient) => (
            <article className="patient-card" key={patient.pet_id}>
              <div className="patient-card-main"><p className="patient-name">{patient.pet_name}</p><span>{speciesLabel[patient.species] ?? patient.species} · {patient.pet_status === "active" ? "Activo" : patient.pet_status}</span></div>
              <div><strong>{patient.guardian_name}</strong><span>{patient.document_number ?? patient.phone ?? patient.email ?? "Sin contacto"}</span></div>
              <div className="patient-chip">{patient.microchip ? `Microchip: ${patient.microchip}` : "Sin microchip"}</div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
