-- Reporting views
create or replace view v_group_ranking as
select
  g.id as group_id,
  g.school_id,
  g.name as group_name,
  g.grade,
  coalesce(sum(sc.points_total), 0) as total_points,
  count(distinct s.challenge_id) as completed_weeks,
  rank() over (partition by g.school_id order by coalesce(sum(sc.points_total), 0) desc) as school_rank
from groups g
left join submissions s on s.group_id = g.id and s.status in ('submitted','approved')
left join scores sc on sc.submission_id = s.id
group by g.id;

create or replace view v_weekly_impact as
select
  wc.school_id,
  e.week_number,
  sum(coalesce(im.kg_separated, 0)) as kg_separated,
  sum(coalesce(im.reused_items, 0)) as reused_items,
  sum(coalesce(im.waste_reduced_estimate, 0)) as waste_reduced_estimate,
  sum(coalesce(s.participants_count, 0)) as participants,
  count(distinct s.id) as submissions_count
from weekly_challenges wc
join experiments e on e.id = wc.experiment_id
left join submissions s on s.challenge_id = wc.id and s.status in ('submitted','approved')
left join impact_metrics im on im.submission_id = s.id
group by wc.school_id, e.week_number;

create or replace view v_school_summary as
select
  sc.id as school_id,
  sc.name as school_name,
  coalesce(sum(wi.kg_separated), 0) as total_kg_separated,
  coalesce(sum(wi.reused_items), 0) as total_reused_items,
  coalesce(sum(wi.participants), 0) as total_participants,
  coalesce(sum(wi.submissions_count), 0) as total_submissions
from schools sc
left join v_weekly_impact wi on wi.school_id = sc.id
group by sc.id;
