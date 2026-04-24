export type AnalyticsEventName =
  | "weekly_challenge_opened"
  | "evidence_submission_started"
  | "evidence_submission_completed"
  | "admin_submission_reviewed"
  | "report_exported";

export type AnalyticsEvent = {
  event: AnalyticsEventName;
  userId?: string;
  groupId?: string;
  schoolId?: string;
  payload?: Record<string, string | number | boolean>;
  at: string;
};

export function buildAnalyticsEvent(
  event: AnalyticsEventName,
  payload?: AnalyticsEvent["payload"]
): AnalyticsEvent {
  return {
    event,
    payload,
    at: new Date().toISOString()
  };
}
