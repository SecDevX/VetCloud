import { describe, expect, it } from "vitest";
import { asTenantId, asUserId } from "@vetcloud/shared-kernel";
import { RegisterGuardianAndPet, type ClientRepository } from "./register-guardian-and-pet";

describe("RegisterGuardianAndPet", () => {
  it("rechaza un tutor duplicado antes de escribir", async () => {
    let saved = false;
    const repository: ClientRepository = {
      existsGuardianDocument: async () => true,
      existsPetMicrochip: async () => false,
      save: async () => { saved = true; },
    };
    const useCase = new RegisterGuardianAndPet(repository, () => crypto.randomUUID());
    await expect(useCase.execute({ fullName: "María Quispe", documentNumber: "12345678", preferredChannel: "phone", petName: "Luna", species: "dog" }, asTenantId(crypto.randomUUID()), asUserId(crypto.randomUUID()))).rejects.toMatchObject({ code: "GUARDIAN_DOCUMENT_EXISTS" });
    expect(saved).toBe(false);
  });
});
