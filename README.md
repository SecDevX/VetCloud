# VetCloud

SaaS multi-tenant para clínicas veterinarias. Este repositorio comienza con la **Fase 0 — Fundacional** del roadmap: monorepo, fronteras de dominio, contratos, UI base y una migración inicial con RLS.

## Estado actual

- `apps/web`: Next.js (App Router), interfaz base del backoffice.
- `packages/shared-kernel`: tipos de dominio transversales, sin dependencias de framework.
- `packages/contracts`: contratos Zod versionados para las APIs/eventos.
- `packages/ui`: componentes visuales compartidos.
- `supabase/migrations`: schemas, helpers de claims JWT y RLS inicial.

## Arranque local

1. Instala dependencias: `pnpm install`.
2. Copia `.env.example` como `.env.local` y configura las claves públicas de tu proyecto Supabase.
3. Ejecuta `pnpm dev` y abre `http://localhost:3000`.

## Conexión a Supabase (cuando tengamos el proyecto)

1. Crear un proyecto Supabase en la región más próxima a Perú.
2. Instalar e iniciar la CLI: `pnpm dlx supabase init`.
3. Vincular el proyecto: `pnpm dlx supabase link --project-ref <ref>`.
4. Revisar y aplicar las migraciones: `pnpm dlx supabase db push`.
5. Configurar el Custom Access Token Hook antes de habilitar usuarios reales, para que el JWT incluya `tenant_id` y `role`.

No se debe añadir nunca `SUPABASE_SERVICE_ROLE_KEY` al frontend ni a un archivo que comience por `NEXT_PUBLIC_`.
