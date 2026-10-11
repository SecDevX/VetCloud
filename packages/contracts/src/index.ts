import { z } from "zod";

export const appRoleSchema = z.enum(["super_admin", "clinic_admin", "veterinarian", "receptionist", "guardian"]);
export const tenantContextSchema = z.object({ tenantId: z.string().uuid(), role: appRoleSchema });

/** Contrato estable para los eventos: toda evolución se publica como una versión nueva. */
export const domainEventSchema = z.object({
  id: z.string().uuid(),
  type: z.string().min(1),
  version: z.literal(1),
  tenantId: z.string().uuid(),
  occurredAt: z.string().datetime(),
  payload: z.record(z.string(), z.unknown()),
});

export type DomainEvent = z.infer<typeof domainEventSchema>;
