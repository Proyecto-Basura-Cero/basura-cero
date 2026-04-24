# Basura Cero en 52 Semanas

Plataforma web escolar para gestionar 52 experimentos ecológicos, registrar evidencias por grupo, medir impacto ambiental y visualizar ranking gamificado.

## Stack
- Next.js + React + TypeScript
- Tailwind CSS
- Supabase (Auth, Postgres, Storage)
- React Hook Form + Zod
- Recharts

## Scripts
- `npm run dev`: desarrollo local
- `npm run build`: build de producción
- `npm run start`: servidor de producción
- `npm run lint`: lint

## Variables de entorno
Crea `.env.local` con:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Estructura clave
- `src/app`: rutas públicas, privadas y API
- `src/components`: componentes reutilizables
- `src/lib`: auth, supabase, reglas de negocio
- `supabase/migrations`: SQL de esquema, RLS, vistas y triggers
- `docs`: producto, alcance MVP y plan de piloto

## Despliegue
1. Conecta el repositorio en Vercel.
2. Configura variables de entorno de Supabase.
3. Ejecuta migraciones SQL en el proyecto Supabase.
4. Publica.
