import type { Airline, AirlineRule, CabinType } from "@/lib/data/types";

export const ALL_CABINS: CabinType[] = ["economy", "premium_economy", "business", "first"];

export const CABIN_LABELS: Record<CabinType, string> = {
  economy: "Economy",
  premium_economy: "Premium economy",
  business: "Business",
  first: "First",
};

// Display order so badges read naturally (Economy first).
const CABIN_ORDER: Record<CabinType, number> = {
  economy: 0,
  premium_economy: 1,
  business: 2,
  first: 3,
};

export interface AirlineCoverage {
  airlineId: string;
  // Cabins that have their own modeled rule (not via fallback).
  cabins: CabinType[];
  // Whether any rule for this airline has published dimensions.
  hasDimensions: boolean;
}

export type CoverageMap = Record<string, AirlineCoverage>;

export function buildCoverageMap(airlines: Airline[], rules: AirlineRule[]): CoverageMap {
  const map: CoverageMap = {};
  for (const airline of airlines) {
    const own = rules.filter((r) => r.airlineId === airline.id);
    const cabins = [...new Set(own.map((r) => r.cabin))].sort(
      (a, b) => CABIN_ORDER[a] - CABIN_ORDER[b],
    );
    map[airline.id] = {
      airlineId: airline.id,
      cabins,
      hasDimensions: own.some((r) => r.maxLengthCm != null),
    };
  }
  return map;
}

// Short human badge for the modeled cabins, e.g. "Economy only",
// "Economy + Business". Dimension completeness is a separate badge.
export function coverageBadge(coverage?: AirlineCoverage): string {
  if (!coverage || coverage.cabins.length === 0) return "Not supported";
  const labels = coverage.cabins.map((c) => CABIN_LABELS[c]);
  if (labels.length === 1) return `${labels[0]} only`;
  return labels.join(" + ");
}

export function isCabinModeled(coverage: AirlineCoverage | undefined, cabin: CabinType): boolean {
  return Boolean(coverage?.cabins.includes(cabin));
}
