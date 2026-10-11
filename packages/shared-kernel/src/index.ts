/** Identificadores nominales: evitan mezclar accidentalmente IDs de dominios distintos. */
export type TenantId = string & { readonly __brand: "TenantId" };
export type UserId = string & { readonly __brand: "UserId" };
export type BranchId = string & { readonly __brand: "BranchId" };

export type StaffRole = "clinic_admin" | "veterinarian" | "receptionist";
export type AppRole = "super_admin" | "guardian" | StaffRole;

export const asTenantId = (value: string): TenantId => value as TenantId;
export const asUserId = (value: string): UserId => value as UserId;
export const asBranchId = (value: string): BranchId => value as BranchId;

export class DomainError extends Error {
  constructor(public readonly code: string, message: string) { super(message); this.name = "DomainError"; }
}
