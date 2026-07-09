export interface EngagementMetrics {
  impressions: number;
  watchTimeMs: number;
  averageDurationMs: number;
  completions: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  follows: number;
  reports: number;
}

export interface DistributionDecision {
  stage: "seed" | "regional" | "continental" | "worldwide" | "limited";
  audienceSize: number;
  countries: string[];
  score: number;
  reason: string;
}

const COUNTRY_POOLS = ["US", "BR", "IN", "ID", "NG", "JP", "DE", "GB", "MX", "FR", "PH", "TR"];

export function initialSeedCountries(authorCountry?: string): string[] {
  const unique = new Set<string>([authorCountry ?? "US"]);
  for (const country of COUNTRY_POOLS) {
    unique.add(country);
    if (unique.size >= 5) break;
  }
  return [...unique];
}

export function scorePost(metrics: EngagementMetrics): number {
  const impressions = Math.max(metrics.impressions, 1);
  const completionRate = metrics.completions / impressions;
  const likeRate = metrics.likes / impressions;
  const commentRate = metrics.comments / impressions;
  const shareRate = metrics.shares / impressions;
  const saveRate = metrics.saves / impressions;
  const followRate = metrics.follows / impressions;
  const reportPenalty = Math.min(metrics.reports / impressions, 0.25) * 4;
  const watchQuality = Math.min(metrics.watchTimeMs / Math.max(metrics.averageDurationMs * impressions, 1), 1.5);

  return Math.max(0, watchQuality * 0.3 + completionRate * 0.22 + likeRate * 0.12 + commentRate * 0.1 + shareRate * 0.14 + saveRate * 0.08 + followRate * 0.08 - reportPenalty);
}

export function nextDistribution(metrics: EngagementMetrics, currentStage: DistributionDecision["stage"], authorCountry?: string): DistributionDecision {
  const score = scorePost(metrics);
  if (metrics.reports / Math.max(metrics.impressions, 1) > 0.08) {
    return { stage: "limited", audienceSize: 0, countries: [], score, reason: "Report rate exceeded safety threshold." };
  }
  const seed = initialSeedCountries(authorCountry);
  if (score >= 0.75) return { stage: "worldwide", audienceSize: 1_000_000, countries: COUNTRY_POOLS, score, reason: "Exceptional retention and sharing unlocked global distribution." };
  if (score >= 0.52 || currentStage === "regional") return { stage: "continental", audienceSize: 150_000, countries: COUNTRY_POOLS.slice(0, 9), score, reason: "Strong engagement expanded the audience across more countries." };
  if (score >= 0.32 || currentStage === "seed") return { stage: "regional", audienceSize: 20_000, countries: COUNTRY_POOLS.slice(0, 7), score, reason: "Promising early engagement expanded beyond the seed audience." };
  return { stage: "seed", audienceSize: 750, countries: seed, score, reason: "Every creator starts with a balanced multi-country seed test." };
}
