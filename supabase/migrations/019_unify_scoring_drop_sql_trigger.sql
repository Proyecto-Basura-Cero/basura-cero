-- Unificacion de scoring: una sola fuente de verdad (capa TS en src/lib/scoring).
--
-- Hasta ahora coexistian dos motores que escribian en scores/group_badges:
--   * El trigger SQL submissions_scoring_trigger (005) -> calculate_submission_score
--     + award_badges_for_group.
--   * La capa TS (scoreSubmission/assignBadges) invocada desde las rutas.
-- Ambos divergian (pesos distintos, el SQL sin penalizacion temporal ni
-- creatividad; badges distintas) y el resultado dependia del orden de escritura.
--
-- Decision: la capa TS es la autoridad. Aqui neutralizamos el motor SQL para
-- eliminar la divergencia. Las vistas de ranking (004) se conservan: leen
-- scores, que ahora puebla exclusivamente la capa TS.

drop trigger if exists submissions_scoring_trigger on submissions;

-- Las funciones se dejan de usar; las removemos para que no se re-cableen por error.
drop function if exists public.handle_submission_scoring() cascade;
drop function if exists public.calculate_submission_score(uuid) cascade;
drop function if exists public.award_badges_for_group(uuid, uuid) cascade;
