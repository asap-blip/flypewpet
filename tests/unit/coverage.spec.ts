import { describe, expect, it } from "vitest";
import { buildCoverageMap, coverageBadge, isCabinModeled } from "@/lib/coverage";
import { airlines, airlineRules } from "@/lib/data/seed";

const map = buildCoverageMap(airlines, airlineRules);

describe("coverage", () => {
  it("reports economy-only airlines accurately", () => {
    expect(map["united"].cabins).toEqual(["economy"]);
    expect(coverageBadge(map["united"])).toBe("Economy only");
  });

  it("reports Lufthansa as economy + business", () => {
    expect(map["lufthansa"].cabins).toContain("economy");
    expect(map["lufthansa"].cabins).toContain("business");
    expect(coverageBadge(map["lufthansa"])).toBe("Economy + Business");
  });

  it("flags Delta as having no published dimensions", () => {
    expect(map["delta"].hasDimensions).toBe(false);
    expect(map["united"].hasDimensions).toBe(true);
  });

  it("isCabinModeled reflects the modeled cabins", () => {
    expect(isCabinModeled(map["united"], "economy")).toBe(true);
    expect(isCabinModeled(map["united"], "business")).toBe(false);
    expect(isCabinModeled(map["lufthansa"], "business")).toBe(true);
  });

  it("returns 'Not supported' for an unknown airline", () => {
    expect(coverageBadge(undefined)).toBe("Not supported");
  });

  it("includes the Canadian carriers as economy with dimensions on file", () => {
    for (const id of ["porter", "westjet", "air-transat", "flair"]) {
      expect(map[id]).toBeDefined();
      expect(map[id].cabins).toEqual(["economy"]);
      expect(map[id].hasDimensions).toBe(true);
    }
  });
});
