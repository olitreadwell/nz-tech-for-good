import { describe, expect, it } from "vitest";
import { url } from "../../src/lib/url";

// Vite (via Vitest) sets import.meta.env.BASE_URL from its own resolved
// config, not from astro.config.mjs, so it is "/" under test rather than the
// real site's "/nz-tech-for-good/". Deriving BASE the same way url.ts does
// keeps these tests exercising the real prefixing/trailing-slash logic
// without hardcoding a value that depends on the bundler's config resolution.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

describe("url()", () => {
  it("returns the base path with a trailing slash for the root route", () => {
    expect(url("/")).toBe(`${BASE}/`);
  });

  it("defaults to the root route when called with no argument", () => {
    expect(url()).toBe(`${BASE}/`);
  });

  it("prefixes a leading-slash path with the base", () => {
    expect(url("/directory/")).toBe(`${BASE}/directory/`);
  });

  it("adds a leading slash to a path that is missing one", () => {
    expect(url("directory/")).toBe(`${BASE}/directory/`);
  });

  it("preserves nested paths", () => {
    expect(url("/entry/some-org/")).toBe(`${BASE}/entry/some-org/`);
  });

  it("does not add a trailing slash that was not in the input", () => {
    expect(url("/entry/some-org")).toBe(`${BASE}/entry/some-org`);
  });
});
