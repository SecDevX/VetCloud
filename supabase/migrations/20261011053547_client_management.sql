-- Fase 1A: Tutores y mascotas. Las tablas conservan tenant_id en cada fila
-- para que las políticas RLS y los índices mantengan el aislamiento eficiente.
create schema if not exists clients;
create extension if not exists pg_trgm;

create type clients.pet_species as enum ('dog', 'cat', 'bird', 'exotic', 'other');
create type clients.preferred_channel as enum ('whatsapp', 'email', 'phone');

create table clients.guardians (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references identity.tenants(id),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  full_name text not null check (char_length(trim(full_name)) >= 2),
  document_number text,
  phone text,
  email text,
  preferred_channel clients.preferred_channel not null default 'whatsapp',
  notes text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  unique (id, tenant_id),
  check (document_number is not null or phone is not null or email is not null)
);

-- Evita duplicar un documento dentro de la misma clínica, manteniendo libres
-- los registros que fueron dados de baja lógica.
create unique index guardians_tenant_document_active_key
  on clients.guardians (tenant_id, document_number)
  where document_number is not null and deleted_at is null;
create index guardians_tenant_name_trgm_idx
  on clients.guardians using gin (full_name gin_trgm_ops)
  where deleted_at is null;
create index guardians_tenant_phone_trgm_idx
  on clients.guardians using gin (phone gin_trgm_ops)
  where phone is not null and deleted_at is null;

create table clients.pets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  guardian_id uuid not null,
  name text not null check (char_length(trim(name)) >= 1),
  species clients.pet_species not null,
  breed text,
  sex text check (sex in ('female', 'male', 'unknown')),
  birth_date date,
  estimated_age_months integer check (estimated_age_months is null or estimated_age_months >= 0),
  weight_kg numeric(6, 2) check (weight_kg is null or weight_kg > 0),
  color text,
  distinguishing_marks text,
  microchip text,
  status text not null default 'active' check (status in ('active', 'inactive', 'deceased')),
  deceased_at date,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint pets_guardian_same_tenant_fk
    foreign key (guardian_id, tenant_id) references clients.guardians (id, tenant_id),
  check (birth_date is null or birth_date <= current_date),
  check (status <> 'deceased' or deceased_at is not null)
);

create unique index pets_tenant_microchip_active_key
  on clients.pets (tenant_id, microchip)
  where microchip is not null and deleted_at is null;
create index pets_tenant_name_trgm_idx
  on clients.pets using gin (name gin_trgm_ops)
  where deleted_at is null;
create index pets_guardian_id_idx on clients.pets (tenant_id, guardian_id) where deleted_at is null;

-- Conservación clínica: una mascota no se elimina físicamente.
create or replace function clients.block_physical_delete()
returns trigger language plpgsql as $$
begin
  raise exception 'PHYSICAL_DELETE_FORBIDDEN: use deleted_at for logical deletion';
end;
$$;
create trigger guardians_prevent_delete before delete on clients.guardians
  for each row execute function clients.block_physical_delete();
create trigger pets_prevent_delete before delete on clients.pets
  for each row execute function clients.block_physical_delete();
create trigger guardians_touch_updated_at before update on clients.guardians
  for each row execute function identity.touch_updated_at();
create trigger pets_touch_updated_at before update on clients.pets
  for each row execute function identity.touch_updated_at();

grant usage on schema clients to authenticated;
grant select, insert, update on clients.guardians to authenticated;
grant select, insert, update on clients.pets to authenticated;

alter table clients.guardians enable row level security;
alter table clients.guardians force row level security;
alter table clients.pets enable row level security;
alter table clients.pets force row level security;

create policy guardians_staff_select on clients.guardians for select to authenticated
  using (tenant_id = (select identity.jwt_tenant()) and identity.jwt_role() in ('clinic_admin', 'veterinarian', 'receptionist'));
create policy guardians_staff_insert on clients.guardians for insert to authenticated
  with check (tenant_id = (select identity.jwt_tenant()) and identity.jwt_role() in ('clinic_admin', 'receptionist'));
create policy guardians_staff_update on clients.guardians for update to authenticated
  using (tenant_id = (select identity.jwt_tenant()) and identity.jwt_role() in ('clinic_admin', 'receptionist'))
  with check (tenant_id = (select identity.jwt_tenant()) and identity.jwt_role() in ('clinic_admin', 'receptionist'));
create policy guardians_portal_select on clients.guardians for select to authenticated
  using (identity.jwt_role() = 'guardian' and auth_user_id = (select auth.uid()));

create policy pets_staff_select on clients.pets for select to authenticated
  using (tenant_id = (select identity.jwt_tenant()) and identity.jwt_role() in ('clinic_admin', 'veterinarian', 'receptionist'));
create policy pets_staff_insert on clients.pets for insert to authenticated
  with check (tenant_id = (select identity.jwt_tenant()) and identity.jwt_role() in ('clinic_admin', 'receptionist'));
create policy pets_staff_update on clients.pets for update to authenticated
  using (tenant_id = (select identity.jwt_tenant()) and identity.jwt_role() in ('clinic_admin', 'receptionist'))
  with check (tenant_id = (select identity.jwt_tenant()) and identity.jwt_role() in ('clinic_admin', 'receptionist'));
create policy pets_portal_select on clients.pets for select to authenticated
  using (
    identity.jwt_role() = 'guardian'
    and exists (
      select 1 from clients.guardians g
      where g.id = guardian_id and g.tenant_id = pets.tenant_id
        and g.auth_user_id = (select auth.uid())
    )
  );
