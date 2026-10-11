import { z } from "zod";
import { DomainError, type TenantId, type UserId } from "@vetcloud/shared-kernel";
import type { Guardian, PreferredChannel } from "../domain/guardian";
import type { Pet, PetSex, PetSpecies } from "../domain/pet";

export const registerGuardianAndPetSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  documentNumber: z.string().trim().min(4).max(32).optional(),
  phone: z.string().trim().min(6).max(30).optional(),
  email: z.string().trim().email().max(254).optional(),
  preferredChannel: z.enum(["whatsapp", "email", "phone"]).default("whatsapp"),
  petName: z.string().trim().min(1).max(100),
  species: z.enum(["dog", "cat", "bird", "exotic", "other"]),
  sex: z.enum(["female", "male", "unknown"]).optional(),
  microchip: z.string().trim().min(4).max(64).optional(),
}).superRefine((value, ctx) => {
  if (!value.documentNumber && !value.phone && !value.email) {
    ctx.addIssue({ code: "custom", message: "Registra documento, teléfono o correo del tutor.", path: ["phone"] });
  }
  if (value.preferredChannel === "whatsapp" && !value.phone) {
    ctx.addIssue({ code: "custom", message: "WhatsApp requiere teléfono.", path: ["phone"] });
  }
  if (value.preferredChannel === "email" && !value.email) {
    ctx.addIssue({ code: "custom", message: "El canal email requiere correo.", path: ["email"] });
  }
});

export type RegisterGuardianAndPetInput = z.infer<typeof registerGuardianAndPetSchema>;

export interface ClientRepository {
  existsGuardianDocument(tenantId: TenantId, documentNumber: string): Promise<boolean>;
  existsPetMicrochip(tenantId: TenantId, microchip: string): Promise<boolean>;
  save(guardian: Guardian, pet: Pet): Promise<void>;
}

export class RegisterGuardianAndPet {
  constructor(private readonly repository: ClientRepository, private readonly newId: () => string) {}

  async execute(input: RegisterGuardianAndPetInput, tenantId: TenantId, actorId: UserId): Promise<{ guardianId: string; petId: string }> {
    const values = registerGuardianAndPetSchema.parse(input);
    if (values.documentNumber && await this.repository.existsGuardianDocument(tenantId, values.documentNumber)) {
      throw new DomainError("GUARDIAN_DOCUMENT_EXISTS", "Ya existe un tutor activo con ese documento.");
    }
    if (values.microchip && await this.repository.existsPetMicrochip(tenantId, values.microchip)) {
      throw new DomainError("PET_MICROCHIP_EXISTS", "Ese microchip ya está registrado en la clínica.");
    }
    const guardianId = this.newId();
    const guardian: Guardian = {
      id: guardianId, tenantId, fullName: values.fullName,
      preferredChannel: values.preferredChannel as PreferredChannel, createdBy: actorId,
      ...(values.documentNumber ? { documentNumber: values.documentNumber } : {}),
      ...(values.phone ? { phone: values.phone } : {}),
      ...(values.email ? { email: values.email } : {}),
    };
    const pet: Pet = {
      id: this.newId(), tenantId, guardianId, name: values.petName, species: values.species as PetSpecies, createdBy: actorId,
      ...(values.sex ? { sex: values.sex as PetSex } : {}),
      ...(values.microchip ? { microchip: values.microchip } : {}),
    };
    await this.repository.save(guardian, pet);
    return { guardianId, petId: pet.id };
  }
}
