"use server";

import { registerGuardianAndPetSchema } from "@vetcloud/client-management";
import { createClient } from "@/lib/supabase/server";

export type RegisterPatientState = { status: "idle" | "success" | "error"; message?: string };

export async function registerPatient(_: RegisterPatientState, formData: FormData): Promise<RegisterPatientState> {
  const parsed = registerGuardianAndPetSchema.safeParse({
    fullName: formData.get("fullName"), documentNumber: formData.get("documentNumber") || undefined,
    phone: formData.get("phone") || undefined, email: formData.get("email") || undefined,
    preferredChannel: formData.get("preferredChannel"), petName: formData.get("petName"),
    species: formData.get("species"), sex: formData.get("sex") || undefined, microchip: formData.get("microchip") || undefined,
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Revisa los datos ingresados." };

  try {
    const supabase = await createClient();
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
    const appMetadata = claimsData?.claims.app_metadata as { tenant_id?: string; role?: string } | undefined;
    if (claimsError || !appMetadata?.tenant_id || !["clinic_admin", "receptionist"].includes(appMetadata.role ?? "")) {
      return { status: "error", message: "Tu sesión no tiene permiso para registrar pacientes." };
    }
    const { error } = await supabase.schema("clients").rpc("register_guardian_and_pet", {
      p_full_name: parsed.data.fullName, p_document_number: parsed.data.documentNumber ?? "", p_phone: parsed.data.phone ?? "",
      p_email: parsed.data.email ?? "", p_preferred_channel: parsed.data.preferredChannel, p_pet_name: parsed.data.petName,
      p_species: parsed.data.species, p_sex: parsed.data.sex ?? "", p_microchip: parsed.data.microchip ?? "",
    });
    if (error) return { status: "error", message: error.code === "23505" ? "El documento o microchip ya está registrado." : "No se pudo registrar. Intenta nuevamente." };
    return { status: "success", message: "Tutor y mascota registrados correctamente." };
  } catch (error) {
    if (error instanceof Error && error.message === "SUPABASE_NOT_CONFIGURED") return { status: "error", message: "Conecta Supabase antes de guardar datos reales." };
    return { status: "error", message: "Ocurrió un error inesperado." };
  }
}
