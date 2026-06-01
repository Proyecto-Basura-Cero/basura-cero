-- Bucket privado para evidencias de los grupos.
-- El acceso (lectura y escritura) se hace via SERVICE_ROLE desde los
-- route handlers de Next.js, usando signed URLs. No agregamos politicas
-- RLS sobre storage.objects porque el SDK del navegador nunca recibe la
-- service role; solo usa signed upload URLs generadas por el server.

insert into storage.buckets (id, name, public)
values ('evidencias', 'evidencias', false)
on conflict (id) do nothing;
