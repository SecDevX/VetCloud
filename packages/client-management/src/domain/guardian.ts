import type { TenantId, UserId } from "@vetcloud/shared-kernel";

export type PreferredChannel = "whatsapp" | "email" | "phone";

export interface Guardian {
  id: string;
  tenantId: TenantId;
  fullName: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  preferredChannel: PreferredChannel;
  createdBy: UserId;
}
