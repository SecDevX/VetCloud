-- Listado de recepción: el filtro se ejecuta dentro de la base y siempre
-- toma el tenant del JWT, nunca del parámetro enviado por la interfaz.
create index guardians_tenant_document_trgm_idx
  on clients.guardians using gin (document_number gin_trgm_ops)
  where document_number is not null and deleted_at is null;
create index pets_tenant_microchip_trgm_idx
  on clients.pets using gin (microchip gin_trgm_ops)
  where microchip is not null and deleted_at is null;

create or replace function clients.search_patients(
  p_query text default null,
  p_limit integer default 50
)
returns table (
  guardian_id uuid,
  guardian_name text,
  document_number text,
  phone text,
  email text,
  pet_id uuid,
  pet_name text,
  species text,
  pet_status text,
  microchip text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    g.id,
    g.full_name,
    g.document_number,
    g.phone,
    g.email,
    p.id,
    p.name,
    p.species::text,
    p.status,
    p.microchip
  from clients.guardians as g
  join clients.pets as p
    on p.guardian_id = g.id
   and p.tenant_id = g.tenant_id
   and p.deleted_at is null
  where g.tenant_id = (select identity.jwt_tenant())
    and g.deleted_at is null
    and (select identity.jwt_role()) in ('clinic_admin', 'veterinarian', 'receptionist')
    and (
      nullif(btrim(p_query), '') is null
      or g.full_name ilike '%' || btrim(p_query) || '%'
      or coalesce(g.document_number, '') ilike '%' || btrim(p_query) || '%'
      or coalesce(g.phone, '') ilike '%' || btrim(p_query) || '%'
      or coalesce(g.email, '') ilike '%' || btrim(p_query) || '%'
      or p.name ilike '%' || btrim(p_query) || '%'
      or coalesce(p.microchip, '') ilike '%' || btrim(p_query) || '%'
    )
  order by g.full_name asc, p.name asc
  limit least(greatest(coalesce(p_limit, 50), 1), 100);
$$;

grant execute on function clients.search_patients(text, integer) to authenticated;
revoke execute on function clients.search_patients(text, integer) from public, anon;
