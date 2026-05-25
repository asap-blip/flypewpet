import { describe, expect, it } from "vitest";
import { freshness } from "@/lib/freshness";

const now = new Date("2026-05-25T00:00:00Z");

describe("freshness", () => {
  it("returns unknown when no date is given", () => {
    expect(freshness(null, now).band).toBe("unknown");
    expect(freshness(undefined, now).band).toBe("unknown");
    expect(freshness("not-a-date", now).band).toBe("unknown");
  });

  it("is fresh within ~120 days", () => {
    expect(freshness("2026-03-15", now).band).toBe("fresh");
  });

  it("is aging between ~120 and ~270 days", () => {
    expect(freshness("2026-01-10", now).band).toBe("aging");
  });

  it("is stale beyond ~270 days", () => {
    expect(freshness("2025-06-01", now).band).toBe("stale");
  });

  it("reports the age in days", () => {
    expect(freshness("2026-05-15", now).ageDays).toBe(10);
  });
});
