-- Dato curioso y conclusion para cada experimento.
alter table experiments
add column if not exists curious_fact text not null default '',
add column if not exists conclusion text not null default '';

-- Rellenar experimentos existentes con texto base editable desde admin.
update experiments
set
  curious_fact = case
    when curious_fact = '' then
      'Dato curioso: separar bien los residuos puede reducir hasta un 30% de la basura que llega a los rellenos sanitarios.'
    else curious_fact
  end,
  conclusion = case
    when conclusion = '' then
      'Conclusion: al completar este experimento aprendemos que pequenas acciones diarias generan un impacto ambiental positivo en el aula y la comunidad.'
    else conclusion
  end
where curious_fact = '' or conclusion = '';
