import Link from "next/link";
import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
  return (
    <main className="sign-in-page">
      <section className="sign-in-card">
        <Link className="back-link" href="/">← Volver al inicio</Link>
        <p className="eyebrow">VETCLOUD · DEMO</p>
        <h1>Ingresa a tu clínica</h1>
        <p>Usa el administrador de prueba configurado en Supabase para guardar pacientes reales en el entorno demo.</p>
        <SignInForm />
      </section>
    </main>
  );
}
