-- Video demostrativo del experimento (materiales e instrucciones paso a paso).
alter table experiments
add column if not exists video_url text;

insert into storage.buckets (id, name, public)
values ('experimentos-videos', 'experimentos-videos', true)
on conflict (id) do nothing;
