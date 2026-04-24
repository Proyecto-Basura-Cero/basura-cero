-- Scoring and badges
create or replace function public.calculate_submission_score(target_submission_id uuid)
returns int
language plpgsql
security definer
as $$
declare
  v_participants int := 0;
  v_kg numeric := 0;
  v_reused int := 0;
  v_file_count int := 0;
  points int := 0;
  breakdown jsonb := '{}'::jsonb;
begin
  select participants_count into v_participants
  from submissions where id = target_submission_id;

  select coalesce(sum(kg_separated), 0), coalesce(sum(reused_items), 0)
  into v_kg, v_reused
  from impact_metrics
  where submission_id = target_submission_id;

  select count(*) into v_file_count
  from evidence_files
  where submission_id = target_submission_id;

  points := points + 25;
  if v_file_count > 0 then
    points := points + 20;
  end if;

  points := points + least(15, greatest(0, v_participants / 2));
  points := points + least(15, greatest(0, floor(v_kg)::int));
  points := points + least(10, greatest(0, v_reused));
  points := least(points, 100);

  breakdown := jsonb_build_object(
    'experiment_completed', 25,
    'evidence_quality', case when v_file_count > 0 then 20 else 0 end,
    'participation', least(15, greatest(0, v_participants / 2)),
    'waste_reduction', least(15, greatest(0, floor(v_kg)::int)),
    'reused_items', least(10, greatest(0, v_reused))
  );

  insert into scores (submission_id, points_total, breakdown_json, calculated_at)
  values (target_submission_id, points, breakdown, now())
  on conflict (submission_id)
  do update set points_total = excluded.points_total,
                breakdown_json = excluded.breakdown_json,
                calculated_at = now(),
                updated_at = now();

  return points;
end;
$$;

create or replace function public.award_badges_for_group(target_group_id uuid, target_submission_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  total_kg numeric := 0;
  completed_count int := 0;
  top3_count int := 0;
begin
  select coalesce(sum(im.kg_separated),0)
  into total_kg
  from submissions s
  join impact_metrics im on im.submission_id = s.id
  where s.group_id = target_group_id;

  select count(*) into completed_count
  from submissions
  where group_id = target_group_id and status in ('submitted','approved');

  if completed_count >= 3 then
    insert into group_badges(group_id, badge_id, source_submission_id)
    select target_group_id, b.id, target_submission_id
    from badges b
    where b.code = 'guardian_reciclaje'
    on conflict (group_id, badge_id) do nothing;
  end if;

  if total_kg >= 15 then
    insert into group_badges(group_id, badge_id, source_submission_id)
    select target_group_id, b.id, target_submission_id
    from badges b
    where b.code = 'super_separador'
    on conflict (group_id, badge_id) do nothing;
  end if;

  select count(*) into top3_count
  from v_group_ranking r
  where r.group_id = target_group_id and r.school_rank <= 3;

  if top3_count > 0 then
    insert into group_badges(group_id, badge_id, source_submission_id)
    select target_group_id, b.id, target_submission_id
    from badges b
    where b.code = 'impacto_dorado'
    on conflict (group_id, badge_id) do nothing;
  end if;
end;
$$;

create or replace function public.handle_submission_scoring()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.status in ('submitted','approved') then
    perform public.calculate_submission_score(new.id);
    perform public.award_badges_for_group(new.group_id, new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists submissions_scoring_trigger on submissions;
create trigger submissions_scoring_trigger
after insert or update of status on submissions
for each row
execute procedure public.handle_submission_scoring();
