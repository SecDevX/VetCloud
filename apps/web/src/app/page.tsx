import { Button } from "@vetcloud/ui";

const phases = [
  ["Fase 0", "Fundacional", "Seguridad, tenants, RLS y diseño base"],
  ["Fase 1", "MVP", "Pacientes, agenda, consulta y caja"],
  ["Fase 2", "Engagement", "Portal, recordatorios, vacunas e inventario"],
  ["Fase 3", "Escala", "Reportes, exportaciones y observabilidad"],
];

export default function Home() {
  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span aria-hidden>✚</span> VetCloud</div>
        <nav aria-label="Navegación principal">
          <a className="active" href="#inicio">Inicio</a>
          <a href="#fases">Hoja de ruta</a>
          <a href="#seguridad">Seguridad</a>
        </nav>
      </aside>
      <section className="content" id="inicio">
        <header className="topbar"><span>Clínica de demostración</span><span className="avatar" aria-label="Usuario de demostración">M</span></header>
        <div className="hero">
          <p className="eyebrow">FASE 0 · EN PROGRESO</p>
          <h1>Una base segura para cuidar mejor.</h1>
          <p>VetCloud organizará la atención, la agenda y la historia clínica sin mezclar los datos de cada veterinaria.</p>
          <div className="actions"><Button>Ver avance de la fase</Button><Button variant="secondary">Guía de conexión</Button></div>
        </div>
        <section id="fases" aria-labelledby="fases-title">
          <div className="section-heading"><div><p className="eyebrow">DESARROLLO INCREMENTAL</p><h2 id="fases-title">Ruta de implementación</h2></div><span>1 de 4 fases</span></div>
          <div className="phase-grid">
            {phases.map(([number, title, description], index) => <article className={`card ${index === 0 ? "current" : ""}`} key={number}><p>{number}</p><h3>{title}</h3><span>{description}</span></article>)}
          </div>
        </section>
        <section className="security" id="seguridad" aria-labelledby="security-title">
          <div><p className="eyebrow">PRINCIPIO NO NEGOCIABLE</p><h2 id="security-title">Aislamiento real por clínica</h2><p>Las políticas de base de datos validarán el tenant y el rol incluso si una pantalla o API cometiera un error.</p></div>
          <ul><li>RLS activado y forzado</li><li>Claims de tenant y rol en JWT</li><li>Auditoría append-only</li></ul>
        </section>
      </section>
    </main>
  );
}
