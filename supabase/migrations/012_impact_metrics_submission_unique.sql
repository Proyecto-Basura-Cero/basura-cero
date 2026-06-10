-- Permite upsert de metricas por envio (una fila por submission).
create unique index if not exists impact_metrics_submission_unique_idx
on impact_metrics (submission_id);
