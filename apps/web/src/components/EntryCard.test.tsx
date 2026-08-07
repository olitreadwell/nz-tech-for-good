import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EntryCard } from "@/components/EntryCard";

const baseEntry = {
  slug: "test-org",
  name: "Test Organisation",
  domain: "civic-tech",
  domainLabel: "Civic Tech",
  what: "Test Organisation does important civic tech work in Aotearoa.",
  region: "wellington",
  tags: ["civic-tech", "open-source"],
  founding_year: 2020,
  takes_contributors: true,
  website: "https://test.org",
  github: "https://github.com/test",
  linkedin_org: "https://linkedin.com/company/test",
  community_url: "https://discord.gg/test",
  events_url: "https://meetup.com/test",
  last_verified: new Date().toISOString().slice(0, 10),
};

describe("EntryCard", () => {
  it("renders name and description", () => {
    render(<EntryCard {...baseEntry} />);
    expect(screen.getByText("Test Organisation")).toBeInTheDocument();
    expect(
      screen.getByText(/does important civic tech work/),
    ).toBeInTheDocument();
  });

  it("shows domain badge", () => {
    render(<EntryCard {...baseEntry} />);
    // Domain label appears twice: badge pill + meta row. Use getAllByText.
    expect(screen.getAllByText("Civic Tech").length).toBeGreaterThanOrEqual(1);
  });

  it("shows region and founding year", () => {
    render(<EntryCard {...baseEntry} />);
    expect(screen.getAllByText("wellington").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Est. 2020/).length).toBeGreaterThanOrEqual(1);
  });

  it("shows contributors badge when true", () => {
    render(<EntryCard {...baseEntry} takes_contributors={true} />);
    expect(screen.getAllByText("Contributors").length).toBeGreaterThanOrEqual(
      1,
    );
  });

  it("hides contributors badge when false", () => {
    const { container } = render(
      <EntryCard {...baseEntry} takes_contributors={false} />,
    );
    // The green badge with "Contributors" text should not exist
    const badges = container.querySelectorAll(".bg-green-100");
    expect(badges.length).toBe(0);
  });

  it("renders metadata icon SVGs for available links", () => {
    const { container } = render(<EntryCard {...baseEntry} />);
    // lucide icons render as SVG elements
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(4); // map pin, clock, branch, briefcase, message, calendar, globe...
  });

  it("renders fewer SVGs when links are empty", () => {
    const { container } = render(
      <EntryCard
        {...baseEntry}
        github=""
        linkedin_org=""
        community_url=""
        events_url=""
        website=""
      />,
    );
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeLessThan(8); // only map pin, clock remain
  });

  it("shows website link when present", () => {
    render(<EntryCard {...baseEntry} />);
    expect(screen.getAllByText("Website").length).toBeGreaterThanOrEqual(1);
  });

  it("shows freshness indicator", () => {
    render(<EntryCard {...baseEntry} />);
    expect(screen.getAllByText(/This week/).length).toBeGreaterThanOrEqual(1);
  });

  it("marks stale entries over 90 days red", () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 100);
    render(
      <EntryCard
        {...baseEntry}
        last_verified={oldDate.toISOString().slice(0, 10)}
      />,
    );
    const freshness = screen.getByText(/mo ago/);
    expect(freshness.closest("span")?.className).toContain("text-red-500");
  });
});
