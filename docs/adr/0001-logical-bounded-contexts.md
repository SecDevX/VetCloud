# ADR 0001: Contextos delimitados lógicos antes de microservicios físicos

- Estado: aceptado
- Fecha: 2026-10-11

## Contexto

VetCloud es un producto nuevo y requiere límites claros entre dominios, pero desplegar procesos y bases de datos separados desde el inicio añade operación sin validar aún el producto.

## Decisión

Cada bounded context tendrá paquete, contratos y schema PostgreSQL propios. La comunicación entre contextos será por funciones de aplicación o eventos, nunca por acceso SQL directo a tablas ajenas. Inicialmente se despliegan juntos en Next.js/Supabase; notificaciones y reportes podrán extraerse a Edge Functions cuando aparezca la necesidad.

## Consecuencias

Se preserva la posibilidad de extracción futura y se reduce el coste operativo inicial. A cambio, se deben vigilar las reglas de importación y mantener pruebas de contrato y RLS desde el comienzo.
