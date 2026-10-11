const phases = [
  ["Fase 0", "Fundacional", "Seguridad, tenants, RLS y diseño base"],
  ["Fase 1A", "Pacientes", "Tutores y mascotas: base técnica lista"],
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
          <a href="/demo/pacientes/nuevo">Pacientes</a>
          <a href="#fases">Hoja de ruta</a>
          <a href="#seguridad">Seguridad</a>
        </nav>
      </aside>
      <section className="content" id="inicio">
        <header className="topbar"><span>Clínica de demostración</span><a className="button secondary" href="/ingresar">Ingresar</a></header>
        <div className="hero">
          <p className="eyebrow">FASE 0 · EN PROGRESO</p>
          <h1>Una base segura para cuidar mejor.</h1>
          <p>VetCloud organizará la atención, la agenda y la historia clínica sin mezclar los datos de cada veterinaria.</p>
          <div className="actions"><a className="button primary" href="/ingresar">Probar inicio de sesión</a><a className="button secondary" href="#clientes">Ver avance de la fase</a></div>
        </div>
        <section id="fases" aria-labelledby="fases-title">
          <div className="section-heading"><div><p className="eyebrow">DESARROLLO INCREMENTAL</p><h2 id="fases-title">Ruta de implementación</h2></div><span>Fase 1A en preparación</span></div>
          <div className="phase-grid">
            {phases.map(([number, title, description], index) => <article className={`card ${index < 2 ? "current" : ""}`} key={number}><p>{number}</p><h3>{title}</h3><span>{description}</span></article>)}
          </div>
        </section>
        <section className="clients-progress" id="clientes" aria-labelledby="clientes-title">
          <div><p className="eyebrow">FASE 1A · CONECTADA</p><h2 id="clientes-title">Tutores y mascotas</h2><p>La primera pieza del MVP ya está conectada a Supabase. Inicia sesión con el administrador demo para guardar datos reales y aislados por clínica.</p></div>
          <div className="progress-grid">
            <article><strong>Registro rápido</strong><span>Un tutor y su mascota se validan juntos, con un dato de contacto obligatorio.</span></article>
            <article><strong>Sin duplicados</strong><span>Documento del tutor y microchip de la mascota se comprueban antes del registro.</span></article>
            <article><strong>Datos aislados</strong><span>Las políticas RLS separan cada clínica y permiten baja lógica, no borrado físico.</span></article>
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
