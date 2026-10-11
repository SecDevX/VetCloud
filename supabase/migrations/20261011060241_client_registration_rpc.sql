-- Operación atómica para el alta rápida en recepción.
-- El tenant y el actor se obtienen de un JWT verificado, nunca del formulario.
create or replace function clients.register_guardian_and_pet(
  p_full_name text,
  p_document_number text,
  p_phone text,
  p_email text,
  p_preferred_channel clients.preferred_channel,
  p_pet_name text,
  p_species clients.pet_species,
  p_sex text,
  p_microchip text
)
returns table (guardian_id uuid, pet_id uuid)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_tenant_id uuid := identity.jwt_tenant();
  v_guardian_id uuid;
  v_pet_id uuid;
begin
  if auth.uid() is null or v_tenant_id is null then
    raise exception 'AUTHENTICATION_REQUIRED';
  end if;
  if identity.jwt_role() not in ('clinic_admin', 'receptionist') then
    raise exception 'ROLE_NOT_ALLOWED';
  end if;
  if coalesce(nullif(trim(p_document_number), ''), nullif(trim(p_phone), ''), nullif(trim(p_email), '')) is null then
    raise exception 'GUARDIAN_CONTACT_REQUIRED';
  end if;

  insert into clients.guardians (
    tenant_id, full_name, document_number, phone, email, preferred_channel, created_by, updated_by
  ) values (
    v_tenant_id,
    trim(p_full_name),
    nullif(trim(p_document_number), ''),
    nullif(trim(p_phone), ''),
    nullif(lower(trim(p_email)), ''),
    p_preferred_channel,
    auth.uid(), auth.uid()
  ) returning id into v_guardian_id;

  insert into clients.pets (
    tenant_id, guardian_id, name, species, sex, microchip, created_by, updated_by
  ) values (
    v_tenant_id,
    v_guardian_id,
    trim(p_pet_name),
    p_species,
    nullif(trim(p_sex), ''),
    nullif(trim(p_microchip), ''),
    auth.uid(), auth.uid()
  ) returning id into v_pet_id;

  return query select v_guardian_id, v_pet_id;
end;
$$;

grant execute on function clients.register_guardian_and_pet(text, text, text, text, clients.preferred_channel, text, clients.pet_species, text, text) to authenticated;
revoke execute on function clients.register_guardian_and_pet(text, text, text, text, clients.preferred_channel, text, clients.pet_species, text, text) from public, anon;
