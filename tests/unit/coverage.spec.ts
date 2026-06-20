import { describe, expect, it } from "vitest";
import { buildCoverageMap, coverageBadge, isCabinModeled } from "@/lib/coverage";
import { airlines, airlineRules } from "@/lib/data/seed";

const map = buildCoverageMap(airlines, airlineRules);

describe("coverage", () => {
  it("reports all cabin classes for cloned-cabin airlines", () => {
    expect(map["united"].cabins).toEqual(["economy", "premium_economy", "business", "first"]);
    expect(coverageBadge(map["united"]).includes("Premium economy")).toBe(true);
    expect(coverageBadge(map["united"]).includes("Business")).toBe(true);
    expect(coverageBadge(map["united"]).includes("First")).toBe(true);
  });

  it("reports Lufthansa across all cabin classes", () => {
    expect(map["lufthansa"].cabins).toEqual(["economy", "premium_economy", "business", "first"]);
    expect(coverageBadge(map["lufthansa"]).includes("Business")).toBe(true);
  });

  it("flags Delta as having no published dimensions", () => {
    expect(map["delta"].hasDimensions).toBe(false);
    expect(map["united"].hasDimensions).toBe(true);
  });

  it("isCabinModeled reflects the modeled cabins", () => {
    expect(isCabinModeled(map["united"], "economy")).toBe(true);
    expect(isCabinModeled(map["united"], "business")).toBe(true);
    expect(isCabinModeled(map["lufthansa"], "business")).toBe(true);
    expect(isCabinModeled(map["klm"], "premium_economy")).toBe(true);
  });

  it("returns 'Not supported' for an unknown airline", () => {
    expect(coverageBadge(undefined)).toBe("Not supported");
  });

  it("includes the Canadian carriers as economy with dimensions on file", () => {
    for (const id of ["porter", "westjet", "air-transat", "flair"]) {
      expect(map[id]).toBeDefined();
      expect(map[id].cabins).toEqual(["economy", "premium_economy", "business", "first"]);
      expect(map[id].hasDimensions).toBe(true);
    }
  });
});
