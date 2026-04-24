import { badgeRules, BadgeEvaluationInput, BadgeRuleCode } from "@/lib/scoring/rules";

export function evaluateUnlockedBadges(input: BadgeEvaluationInput): BadgeRuleCode[] {
  return badgeRules.filter((rule) => rule.evaluate(input)).map((rule) => rule.code);
}
