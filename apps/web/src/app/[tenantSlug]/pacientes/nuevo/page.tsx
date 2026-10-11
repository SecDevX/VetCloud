import { RegisterPatientForm } from "./register-patient-form";

export default function NewPatientPage() {
  return <main className="patient-page"><a className="back-link" href="/">← Volver al inicio</a><p className="eyebrow">FASE 1A · RECEPCIÓN</p><h1>Registrar tutor y mascota</h1><p className="page-intro">Crea ambos registros en una sola operación. Al conectar Supabase, el aislamiento por clínica se aplicará desde la base de datos.</p><RegisterPatientForm /></main>;
}
