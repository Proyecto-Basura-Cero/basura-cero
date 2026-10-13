-- Vista de progreso individual del alumno por reto (para progreso visible y
-- para auditar la agregacion alumno->grupo que calcula la capa TS).
--
-- El ranking publico sigue siendo por GRUPO (v_group_ranking). Esta vista NO
-- cambia el ranking; expone el progreso individual (pasos completados y juego)
-- para mostrarlo al alumno/maestro.

create or replace view v_student_progress as
select
  st.id as student_id,
  st.alias,
  st.group_id,
  st.school_id,
  wc.id as challenge_id,
  e.week_number,
  count(distinct ssp.step_id) as steps_completed,
  (select count(*) from experiment_steps es where es.experiment_id = e.id) as steps_total,
  count(distinct sgp.game_id) filter (where sgp.completed_at is not null) as games_completed,
  coalesce(bool_or(ssub.status = 'approved'), false) as evidence_approved
from students st
cross join weekly_challenges wc
join experiments e on e.id = wc.experiment_id
left join student_step_progress ssp
  on ssp.student_id = st.id and ssp.challenge_id = wc.id
left join student_game_progress sgp
  on sgp.student_id = st.id and sgp.challenge_id = wc.id
left join student_submissions ssub
  on ssub.student_id = st.id and ssub.challenge_id = wc.id
where wc.school_id = st.school_id
group by st.id, st.alias, st.group_id, st.school_id, wc.id, e.week_number, e.id;
