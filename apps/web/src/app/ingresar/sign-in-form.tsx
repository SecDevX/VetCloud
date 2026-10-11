"use client";

import { useActionState } from "react";
import { signIn, type SignInState } from "./actions";

const initialState: SignInState = { status: "idle" };

export function SignInForm() {
  const [state, action, pending] = useActionState(signIn, initialState);

  return (
    <form className="sign-in-form" action={action}>
      <label>Correo
        <input name="email" type="email" autoComplete="email" required placeholder="admin@clinica.com" />
      </label>
      <label>Contraseña
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state.status === "error" && <p className="form-message error" role="alert">{state.message}</p>}
      <button type="submit" disabled={pending}>{pending ? "Ingresando…" : "Ingresar"}</button>
    </form>
  );
}
