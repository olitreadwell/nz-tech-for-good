import path from "node:path";
import { beforeAll, describe, expect, it, vi } from "vitest";

// data.ts reads YAML files from a hardcoded path (../../../data/entries,
// relative to site/src/lib) at module-import time. To keep this suite fast,
// deterministic, and independent of the live 150+ entry directory, we mock
// node:fs so every readdirSync/readFileSync call resolves against the tiny
// fixture set in tests/fixtures/entries instead. This is a pure interception
// of the Node API data.ts already uses; src/lib/data.ts itself is untouched.
//
// The fixture set has 5 valid entries plus 3 deliberately invalid YAML files
// (_skip-*.yaml) that exercise the loader's "skip this file" branches:
//   - Aroha Data Collective   (Māori data sovereignty, Wellington)
//   - Civic Data Lab          (civic-tech, Auckland)
//   - Civic Watch             (civic-tech, Wellington, minimal fields)
//   - Kai Rescue NZ           (food-rescue, Auckland)
//   - Minimal Required Only   (only `name` set; every other field defaults)
const FIXTURES_DIR = path.resolve(__dirname, "../fixtures/entries");

vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs")>();
  return {
    ...actual,
    readdirSync: (..._args: unknown[]) => actual.readdirSync(FIXTURES_DIR),
    readFileSync: (file: unknown, ...args: unknown[]) => {
      const base = path.basename(String(file));
      return (actual.readFileSync as (p: string, ...a: unknown[]) => unknown)(
        path.join(FIXTURES_DIR, base),
        ...args
      );
    },
  };
});

let data: typeof import("../../src/lib/data");

beforeAll(async () => {
  data = await import("../../src/lib/data");
});

describe("domainLabel()", () => {
  it("returns the human-friendly label for a known domain key", () => {
    expect(data.domainLabel("civic-tech")).toBe("Civic Tech");
  });

  it("falls back to the raw key for an unknown domain", () => {
    expect(data.domainLabel("some-unmapped-domain")).toBe("some-unmapped-domain");
  });
});

describe("domainDescription()", () => {
  it("returns the explainer text for a known domain key", () => {
    expect(data.domainDescription("civic-tech")).toContain(
      "take part in how their communities"
    );
  });

  it("falls back to an empty string for an unknown domain", () => {
    expect(data.domainDescription("some-unmapped-domain")).toBe("");
  });
});

describe("slugify()", () => {
  it("lowercases and hyphenates", () => {
    expect(data.slugify("Civic Tech")).toBe("civic-tech");
  });

  it("strips macrons via NFKD normalisation", () => {
    expect(data.slugify("Māori Data Sovereignty")).toBe("maori-data-sovereignty");
  });

  it("collapses non-alphanumeric runs into a single hyphen", () => {
    expect(data.slugify("worker-coop / platform-coop tech")).toBe(
      "worker-coop-platform-coop-tech"
    );
  });

  it("trims leading and trailing hyphens", () => {
    expect(data.slugify("  -Wellington-  ")).toBe("wellington");
  });
});

describe("entries (loaded from fixture YAML)", () => {
  it("loads one entry per valid fixture file, skipping the invalid ones", () => {
    // 8 files on disk, 3 of them deliberately malformed (_skip-*.yaml).
    expect(data.entries).toHaveLength(5);
  });

  it("skips a file whose YAML parses to nothing", () => {
    expect(data.entries.find((e) => e.slug === "_skip-empty")).toBeUndefined();
  });

  it("skips a file whose YAML root is not a mapping", () => {
    expect(data.entries.find((e) => e.slug === "_skip-scalar")).toBeUndefined();
  });

  it("skips a file whose mapping has no name field", () => {
    expect(data.entries.find((e) => e.slug === "_skip-no-name")).toBeUndefined();
  });

  it("sorts entries alphabetically by name, case-insensitively", () => {
    expect(data.entries.map((e) => e.name)).toEqual([
      "Aroha Data Collective",
      "Civic Data Lab",
      "Civic Watch",
      "Kai Rescue NZ",
      "Minimal Required Only",
    ]);
  });

  it("derives slug from the filename, not from the entry name", () => {
    const entry = data.entries.find((e) => e.name === "Aroha Data Collective");
    expect(entry?.slug).toBe("aroha-data-collective");
  });

  it("attaches the resolved domain label", () => {
    const entry = data.entries.find((e) => e.name === "Aroha Data Collective");
    expect(entry?.domain).toBe("Māori data sovereignty / indigenous data");
    expect(entry?.domainLabel).toBe("Māori Data Sovereignty");
  });

  it("fills in every optional field with its documented default when absent", () => {
    const entry = data.entries.find((e) => e.name === "Civic Watch");
    expect(entry).toMatchObject({
      github: "",
      linkedin_org: "",
      linkedin_people: [],
      tags: [],
      related_to: [],
      source: "",
      founding_year: null,
      takes_contributors: null,
      careers_url: "",
      last_verified: "",
    });
  });

  it("defaults domain, what, region, and website when the whole file omits them", () => {
    const entry = data.entries.find((e) => e.name === "Minimal Required Only");
    expect(entry).toMatchObject({
      domain: "",
      domainLabel: "",
      what: "",
      region: "",
      website: "",
    });
  });

  it("preserves an explicit false, distinct from the null default", () => {
    const entry = data.entries.find((e) => e.name === "Kai Rescue NZ");
    expect(entry?.takes_contributors).toBe(false);
  });

  it("keeps linkedin_people entries intact", () => {
    const entry = data.entries.find((e) => e.name === "Aroha Data Collective");
    expect(entry?.linkedin_people).toEqual([
      { name: "Jane Doe", role: "Lead", linkedin_url: "https://linkedin.com/in/jane-doe-example" },
    ]);
  });
});

describe("totalEntries", () => {
  it("matches the number of loaded entries", () => {
    expect(data.totalEntries).toBe(data.entries.length);
  });
});

describe("domains index", () => {
  it("has one entry per distinct domain, including the empty-string default", () => {
    // civic-tech, food-rescue, Māori data sovereignty, and "" (from the
    // entry that omits `domain` entirely).
    expect(data.domains).toHaveLength(4);
  });

  it("counts entries per domain and puts the biggest first", () => {
    expect(data.domains[0]).toMatchObject({ key: "civic-tech", count: 2 });
  });

  it("breaks a count tie by label, alphabetically", () => {
    // food-rescue, Māori data sovereignty, and "" all have count 1.
    const tied = data.domains.filter((d) => d.count === 1);
    expect(tied.map((d) => d.label)).toEqual([
      "",
      "Food Rescue & Food Security Tech",
      "Māori Data Sovereignty",
    ]);
  });

  it("computes a URL-safe slug per domain", () => {
    const maori = data.domains.find((d) => d.key === "Māori data sovereignty / indigenous data");
    expect(maori?.slug).toBe("maori-data-sovereignty-indigenous-data");
  });
});

describe("regions index", () => {
  it("counts entries per region", () => {
    const wellington = data.regions.find((r) => r.name === "Wellington");
    const auckland = data.regions.find((r) => r.name === "Auckland");
    expect(wellington?.count).toBe(2); // Aroha Data Collective + Civic Watch
    expect(auckland?.count).toBe(2); // Civic Data Lab + Kai Rescue NZ
  });

  it("breaks a count tie by name, alphabetically, ahead of lower-count regions", () => {
    // Auckland and Wellington are tied at count 2; "" (from the entry that
    // omits `region` entirely) has count 1 and sorts after both.
    expect(data.regions.map((r) => r.name)).toEqual(["Auckland", "Wellington", ""]);
  });
});

describe("tags index", () => {
  it("counts each tag across entries with no double counting", () => {
    const dataTag = data.tags.find((t) => t.name === "data");
    expect(dataTag?.count).toBe(1);
  });

  it("excludes entries with no tags from skewing counts", () => {
    // Civic Watch and Civic Data Lab have no tags; the tag list should not
    // contain an empty entry.
    expect(data.tags.find((t) => t.name === "")).toBeUndefined();
  });
});

describe("entriesByDomain()", () => {
  it("returns only entries in the given domain, in the entries' sort order", () => {
    const result = data.entriesByDomain("civic-tech");
    expect(result.map((e) => e.name)).toEqual(["Civic Data Lab", "Civic Watch"]);
  });

  it("returns an empty array for a domain with no entries", () => {
    expect(data.entriesByDomain("no-such-domain")).toEqual([]);
  });
});

describe("entriesByRegion()", () => {
  it("returns only entries in the given region", () => {
    const result = data.entriesByRegion("Auckland");
    expect(result.map((e) => e.name)).toEqual(["Civic Data Lab", "Kai Rescue NZ"]);
  });
});

describe("domainBySlug()", () => {
  it("finds a domain by its slug", () => {
    expect(data.domainBySlug("civic-tech")?.key).toBe("civic-tech");
  });

  it("returns undefined for an unknown slug", () => {
    expect(data.domainBySlug("nope")).toBeUndefined();
  });
});

describe("regionBySlug()", () => {
  it("finds a region by its slug", () => {
    expect(data.regionBySlug("auckland")?.name).toBe("Auckland");
  });

  it("returns undefined for an unknown slug", () => {
    expect(data.regionBySlug("nope")).toBeUndefined();
  });
});

describe("edges (relationship resolution)", () => {
  it("resolves an exact-name related_to reference", () => {
    const pair = data.edges.find(
      ([a, b]) =>
        (a === "Aroha Data Collective" && b === "Kai Rescue NZ") ||
        (a === "Kai Rescue NZ" && b === "Aroha Data Collective")
    );
    expect(pair).toBeDefined();
  });

  it("resolves a reference with a parenthetical suffix via name normalisation, deduping with the exact match", () => {
    // kai-rescue-nz.yaml also references "Aroha Data Collective (Wellington)",
    // which must collapse onto the same edge as the exact match above.
    const matches = data.edges.filter(
      ([a, b]) =>
        (a === "Aroha Data Collective" && b === "Kai Rescue NZ") ||
        (a === "Kai Rescue NZ" && b === "Aroha Data Collective")
    );
    expect(matches).toHaveLength(1);
  });

  it("resolves a fuzzy substring reference to the matching entry", () => {
    // kai-rescue-nz.yaml references "Watch", a substring only of "Civic Watch".
    const pair = data.edges.find(
      ([a, b]) =>
        (a === "Civic Watch" && b === "Kai Rescue NZ") ||
        (a === "Kai Rescue NZ" && b === "Civic Watch")
    );
    expect(pair).toBeDefined();
  });

  it("excludes a self-reference", () => {
    const selfPair = data.edges.find(
      ([a, b]) => a === "Aroha Data Collective" && b === "Aroha Data Collective"
    );
    expect(selfPair).toBeUndefined();
  });

  it("silently drops a reference that matches no entry", () => {
    // "Does Not Exist In Fixtures" should not appear anywhere in edges.
    const bogus = data.edges.find(
      ([a, b]) => a === "Does Not Exist In Fixtures" || b === "Does Not Exist In Fixtures"
    );
    expect(bogus).toBeUndefined();
  });

  it("has exactly three undirected edges for this fixture set", () => {
    expect(data.edges).toHaveLength(3);
  });
});

describe("domainEdges (cross-domain edge counts)", () => {
  it("counts a cross-domain connection once", () => {
    // Aroha Data Collective (Māori data sovereignty) <-> Kai Rescue NZ (food-rescue)
    const edge = data.domainEdges.find(
      (e) =>
        (e.a === "Māori data sovereignty / indigenous data" &&
          e.b === "food-rescue / food-security tech") ||
        (e.b === "Māori data sovereignty / indigenous data" &&
          e.a === "food-rescue / food-security tech")
    );
    expect(edge?.count).toBe(1);
  });

  it("excludes an edge between two entries in the same domain", () => {
    // Civic Data Lab <-> Civic Watch are both civic-tech; that edge must not
    // appear in domainEdges (it is same-domain, not cross-domain).
    for (const e of data.domainEdges) {
      expect(e.a).not.toBe(e.b);
    }
    expect(data.domainEdges).toHaveLength(2);
  });
});

describe("internalEdges()", () => {
  it("returns edges where both entries share the given domain", () => {
    expect(data.internalEdges("civic-tech")).toEqual([["Civic Data Lab", "Civic Watch"]]);
  });

  it("returns an empty array for a domain with no internal connections", () => {
    expect(data.internalEdges("food-rescue / food-security tech")).toEqual([]);
    expect(data.internalEdges("Māori data sovereignty / indigenous data")).toEqual([]);
  });
});

describe("relatedEntries()", () => {
  it("returns the resolved entries connected to a given entry, sorted by name", () => {
    const kaiRescue = data.entries.find((e) => e.name === "Kai Rescue NZ")!;
    const related = data.relatedEntries(kaiRescue);
    expect(related.map((e) => e.name)).toEqual(["Aroha Data Collective", "Civic Watch"]);
  });

  it("includes connections recorded by other entries pointing at this one", () => {
    // Civic Watch has no related_to of its own; both its connections come
    // from Kai Rescue NZ and Civic Data Lab referencing it.
    const civicWatch = data.entries.find((e) => e.name === "Civic Watch")!;
    const related = data.relatedEntries(civicWatch);
    expect(related.map((e) => e.name)).toEqual(["Civic Data Lab", "Kai Rescue NZ"]);
  });

  it("returns an empty array for an entry with no connections", () => {
    // Not exercised by this fixture set directly, so build a standalone
    // entry shape to confirm the function handles zero matches.
    const lonely = { ...data.entries[0], name: "Nobody Links Here" };
    expect(data.relatedEntries(lonely)).toEqual([]);
  });
});
