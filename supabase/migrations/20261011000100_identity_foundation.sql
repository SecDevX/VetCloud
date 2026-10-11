-- Fase 0: identidad y aislamiento multi-tenant.
-- Todas las migraciones posteriores deben activar y forzar RLS en cada tabla de negocio.

create schema if not exists identity;
create schema if not exists audit;
create extension if not exists pgcrypto;

create type identity.app_role as enum (
  'super_admin', 'clinic_admin', 'veterinarian', 'receptionist', 'guardian'
);

create type identity.tenant_status as enum ('trial', 'active', 'suspended', 'cancelled');

create table identity.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,63}$'),
  legal_name text not null,
  plan_code text not null default 'free' check (plan_code in ('free', 'basic', 'pro')),
  status identity.tenant_status not null default 'trial',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table identity.branches (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references identity.tenants(id),
  name text not null,
  timezone text not null default 'America/Lima',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, name)
);
create index branches_tenant_id_idx on identity.branches (tenant_id);

-- El perfil enlaza auth.users con el tenant y el rol de aplicación.
-- Solo procesos administrativos de servidor crean o modifican esta tabla.
create table identity.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references identity.tenants(id),
  role identity.app_role not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((role = 'super_admin' and tenant_id is null) or (role <> 'super_admin' and tenant_id is not null))
);
create index profiles_tenant_id_idx on identity.profiles (tenant_id);

-- Claims que las políticas RLS pueden leer sin consultar tablas de dominio.
create or replace function identity.jwt_tenant()
returns uuid language sql stable set search_path = '' as $$
  select nullif(auth.jwt() -> 'app_metadata' ->> 'tenant_id', '')::uuid
$$;

create or replace function identity.jwt_role()
returns text language sql stable set search_path = '' as $$
  select auth.jwt() -> 'app_metadata' ->> 'role'
$$;

-- El hook se habilita desde el panel Auth de Supabase tras aplicar la migración.
-- Solo expone las claims mínimas para RLS; no añade datos clínicos ni fiscales al JWT.
create or replace function identity.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  profile identity.profiles;
  claims jsonb;
begin
  select * into profile from identity.profiles where user_id = (event->>'user_id')::uuid;
  claims := event->'claims';
  if profile.user_id is not null then
    claims := jsonb_set(claims, '{app_metadata,role}', to_jsonb(profile.role::text), true);
    if profile.tenant_id is not null then
      claims := jsonb_set(claims, '{app_metadata,tenant_id}', to_jsonb(profile.tenant_id::text), true);
    end if;
  end if;
  return jsonb_set(event, '{claims}', claims);
end;
$$;

-- El hook es un privilegio de Auth, no una API para usuarios de la aplicación.
grant usage on schema identity to supabase_auth_admin;
grant execute on function identity.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function identity.custom_access_token_hook(jsonb) from public, anon, authenticated;

grant usage on schema identity to authenticated;
grant select on identity.tenants, identity.branches, identity.profiles to authenticated;
grant execute on function identity.jwt_tenant() to authenticated;
grant execute on function identity.jwt_role() to authenticated;

alter table identity.tenants enable row level security;
alter table identity.tenants force row level security;
alter table identity.branches enable row level security;
alter table identity.branches force row level security;
alter table identity.profiles enable row level security;
alter table identity.profiles force row level security;

-- El super_admin administra metadatos de tenant; no recibe acceso a otros schemas.
create policy tenants_select_own_or_admin on identity.tenants for select to authenticated
  using (id = identity.jwt_tenant() or identity.jwt_role() = 'super_admin');
create policy tenants_update_admin on identity.tenants for update to authenticated
  using (identity.jwt_role() = 'super_admin') with check (identity.jwt_role() = 'super_admin');

create policy branches_same_tenant on identity.branches for select to authenticated
  using (tenant_id = identity.jwt_tenant());
create policy branches_admin_write on identity.branches for all to authenticated
  using (tenant_id = identity.jwt_tenant() and identity.jwt_role() = 'clinic_admin')
  with check (tenant_id = identity.jwt_tenant() and identity.jwt_role() = 'clinic_admin');

create policy profiles_self_or_tenant_admin on identity.profiles for select to authenticated
  using (user_id = auth.uid() or (tenant_id = identity.jwt_tenant() and identity.jwt_role() = 'clinic_admin'));

-- Log transversal append-only. Ningún rol de aplicación puede editar ni borrar eventos.
create table audit.log (
  id bigint generated always as identity primary key,
  tenant_id uuid,
  actor_id uuid,
  action text not null,
  entity text not null,
  entity_id uuid,
  detail jsonb not null default '{}'::jsonb,
  at timestamptz not null default now()
);
create index audit_log_tenant_at_idx on audit.log (tenant_id, at desc);
alter table audit.log enable row level security;
alter table audit.log force row level security;
revoke all on audit.log from anon, authenticated;

-- Utilidad reutilizable en tablas con updated_at.
create or replace function identity.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end; $$;
create trigger tenants_touch_updated_at before update on identity.tenants for each row execute function identity.touch_updated_at();
create trigger branches_touch_updated_at before update on identity.branches for each row execute function identity.touch_updated_at();
create trigger profiles_touch_updated_at before update on identity.profiles for each row execute function identity.touch_updated_at();
