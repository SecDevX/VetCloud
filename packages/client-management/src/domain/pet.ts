import type { TenantId, UserId } from "@vetcloud/shared-kernel";

export type PetSpecies = "dog" | "cat" | "bird" | "exotic" | "other";
export type PetSex = "female" | "male" | "unknown";

export interface Pet {
  id: string;
  tenantId: TenantId;
  guardianId: string;
  name: string;
  species: PetSpecies;
  sex?: PetSex;
  microchip?: string;
  createdBy: UserId;
}
