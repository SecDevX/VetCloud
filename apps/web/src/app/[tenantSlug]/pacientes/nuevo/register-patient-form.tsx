"use client";

import { useActionState } from "react";
import { registerPatient, type RegisterPatientState } from "./actions";

const initialState: RegisterPatientState = { status: "idle" };

export function RegisterPatientForm() {
  const [state, action, pending] = useActionState(registerPatient, initialState);
  return <form className="patient-form" action={action}>
    <fieldset><legend>Tutor</legend>
      <label>Nombre completo<input name="fullName" required minLength={2} placeholder="María Quispe" /></label>
      <div className="field-row"><label>Documento<input name="documentNumber" placeholder="DNI o CE" /></label><label>Teléfono<input name="phone" type="tel" placeholder="987 654 321" /></label></div>
      <div className="field-row"><label>Correo<input name="email" type="email" placeholder="maria@email.com" /></label><label>Canal preferido<select name="preferredChannel" defaultValue="whatsapp"><option value="whatsapp">WhatsApp</option><option value="phone">Teléfono</option><option value="email">Correo</option></select></label></div>
    </fieldset>
    <fieldset><legend>Mascota</legend>
      <div className="field-row"><label>Nombre<input name="petName" required placeholder="Luna" /></label><label>Especie<select name="species" required defaultValue="dog"><option value="dog">Perro</option><option value="cat">Gato</option><option value="bird">Ave</option><option value="exotic">Exótico</option><option value="other">Otro</option></select></label></div>
      <div className="field-row"><label>Sexo<select name="sex" defaultValue=""><option value="">No especificado</option><option value="female">Hembra</option><option value="male">Macho</option><option value="unknown">Desconocido</option></select></label><label>Microchip<input name="microchip" placeholder="Opcional" /></label></div>
    </fieldset>
    <p className="form-help">Documento, teléfono o correo son obligatorios para el tutor.</p>
    {state.status !== "idle" && <p className={`form-message ${state.status}`} role="status">{state.message}</p>}
    <button type="submit" disabled={pending}>{pending ? "Guardando…" : "Registrar tutor y mascota"}</button>
  </form>;
}
