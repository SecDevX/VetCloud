# Fase 0 — Fundacional

## Objetivo

Crear una base que permita añadir módulos sin comprometer el aislamiento entre clínicas ni acoplar el dominio a Next.js o Supabase.

## Entregado en este incremento

- Monorepo `pnpm` + Turborepo y TypeScript estricto.
- Paquetes independientes para kernel compartido, contratos y UI.
- Aplicación Next.js mínima con la identidad visual en tonos celestes.
- Configuración inicial de Supabase y migración de `identity`/`audit`.
- RLS forzado para tenants, sucursales y perfiles, con helpers de claims JWT.
- Hook de Access Token preparado para incluir `tenant_id` y `role`.

## No se implementa aún

No hay registro de pacientes, agenda, consultas, facturas ni acceso de usuarios reales. Es deliberado: estas funciones comienzan en la Fase 1 tras validar que el proyecto, las migraciones y el login base se conectan correctamente.

## Prueba de aceptación de esta fase

1. Levantar el sitio localmente con `pnpm dev`.
2. Crear y vincular un proyecto de Supabase.
3. Aplicar la migración y habilitar el Custom Access Token Hook `identity.custom_access_token_hook` en Auth.
4. Crear un tenant, una sucursal y un usuario de prueba con rol `clinic_admin` desde un script administrativo seguro.
5. Confirmar que el JWT del usuario contiene `app_metadata.tenant_id` y `app_metadata.role`.
6. Confirmar que un usuario sin el mismo `tenant_id` no puede leer sucursales ajenas.

## Siguiente incremento: Fase 1A

Construir `client-management`: migración de tutores y mascotas, RLS, contratos Zod, formulario de registro y búsqueda por nombre/documento/teléfono/microchip. Solo después pasaremos a agenda y a la exclusión de solapamientos.
