-- Verification queries
-- 1. Conteo de experimentos
select count(*) as experiments_count from experiments;

-- 2. Ranking base
select * from v_group_ranking order by total_points desc limit 10;

-- 3. Impacto semanal
select * from v_weekly_impact order by week_number asc limit 20;

-- 4. Resumen escolar
select * from v_school_summary;

-- 5. Validar RLS (ejecutar con distintos roles)
select current_setting('request.jwt.claim.role', true) as jwt_role;
