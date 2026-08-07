import { describe, it, expect } from "vitest";
import { getAllEntries, getDomains, getRegions } from "@/lib/data";

describe("data loader", () => {
  it("loads all entries as an array", () => {
    const entries = getAllEntries();
    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0]).toHaveProperty("name");
    expect(entries[0]).toHaveProperty("slug");
    expect(entries[0]).toHaveProperty("domain");
  });

  it("returns cached entries on subsequent calls", () => {
    const a = getAllEntries();
    const b = getAllEntries();
    expect(a).toBe(b); // same reference — cached
  });

  it("sorts entries by name case-insensitively", () => {
    const entries = getAllEntries();
    for (let i = 1; i < entries.length; i++) {
      expect(
        entries[i - 1].name.toLowerCase().localeCompare(
          entries[i].name.toLowerCase(),
        ),
      ).toBeLessThanOrEqual(0);
    }
  });

  it("getDomains returns sorted by count", () => {
    const domains = getDomains();
    expect(domains.length).toBeGreaterThan(0);
    expect(domains[0]).toHaveProperty("key");
    expect(domains[0]).toHaveProperty("label");
    expect(domains[0]).toHaveProperty("count");
    for (let i = 1; i < domains.length; i++) {
      expect(domains[i - 1].count).toBeGreaterThanOrEqual(domains[i].count);
    }
  });

  it("getRegions returns sorted by count", () => {
    const regions = getRegions();
    expect(regions.length).toBeGreaterThan(0);
    expect(regions[0]).toHaveProperty("name");
    expect(regions[0]).toHaveProperty("count");
    for (let i = 1; i < regions.length; i++) {
      expect(regions[i - 1].count).toBeGreaterThanOrEqual(regions[i].count);
    }
  });
});
