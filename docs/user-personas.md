# User personas

Six personas who use the NZ Tech-for-Good directory, their needs,
journeys, and pain points.

## 1. Job Seeker — Tāne

**Who**: Early-career developer looking for mission-driven work in NZ.
**Needs**: Find orgs that are hiring, filter by region and domain, see what
kinds of roles exist in tech-for-good.
**Journey**: Lands on homepage → filters directory by region (Wellington) →
looks for orgs with careers pages → opens several career URLs → bookmarks
interesting orgs.
**Pain points**: Can't filter by "hiring" or "takes contributors." Most
entries don't have careers URLs filled in. No way to save/bookmark entries.
**Features needed**: Hiring/takes-contributors filter, careers URL
prominence, saved entries (localStorage bookmarks), "orgs hiring near you."

## 2. Volunteer — Māia

**Who**: Data scientist wanting to volunteer skills for a cause.
**Needs**: Find orgs that take volunteers, match skills to opportunities,
understand what kind of help each org needs.
**Journey**: Searches for "data" or browses by domain → looks for orgs marked
"takes contributors" → visits websites to find volunteer pages → contacts
orgs.
**Pain points**: No skills-based filtering. Takes-contributors field often
null. No indication of what kind of volunteers are needed. Can't filter by
remote vs in-person.
**Features needed**: Volunteer-matching search, skills taxonomy,
contributor-type indicators, remote/in-person badge.

## 3. Researcher — Dr. Aroha

**Who**: Academic studying NZ's civic tech ecosystem for a paper.
**Needs**: Comprehensive data, export capabilities, citation info,
methodology transparency, domain overviews.
**Journey**: Browsing by domain → reading stats page → exporting data as
CSV/JSON → citing the directory in a paper → referencing methodology.
**Pain points**: Data exports work but need documentation. No citation
generator. Methodology spread across multiple docs. Can't filter by founding
year or other structured fields.
**Features needed**: Citation generator, methodology page, enhanced data
exports, structured field filters (founding year range), API documentation.

## 4. Org Representative — Hana

**Who**: Runs a small climate-tech nonprofit, wants their org listed and
wants to discover peer orgs.
**Needs**: Add/edit their entry, see similar orgs, understand the ecosystem
they're part of, connect with peers.
**Journey**: Uses "Suggest an entry" → checks directory for similar orgs →
browses ecosystem page → looks at domain connections → follows links to peer
orgs.
**Pain points**: Entry editing requires GitHub PR (technical barrier). No
"similar orgs" recommendations. Ecosystem page is a single graph, hard to
navigate. No way to claim/verify an org entry.
**Features needed**: "Similar orgs" widget on entry pages, "also in this
domain" section (exists), claimed/verified org badge, easier entry editing.

## 5. Funder / Investor — James

**Who**: Impact investor evaluating the NZ tech-for-good landscape for
potential grants.
**Needs**: Overview of the ecosystem, org sizes and maturity, domain
coverage, gaps in the landscape.
**Journey**: Reads stats page → browses by domain → looks at entry founding
years and descriptions → identifies gaps → downloads data for analysis.
**Pain points**: No org size/staff indicators. No funding information. Can't
see org maturity distribution. Missing founding years for many entries.
Stats page exists but could show more.
**Features needed**: Maturity indicators (founding decade filter), org
size/staff count, domain gap analysis, funder-focused stats.

## 6. Curious Citizen — Sam

**Who**: New to NZ, heard about tech-for-good, wants to learn what exists and
how to get involved.
**Needs**: Simple introduction, guided exploration, clear next steps, not
overwhelming.
**Journey**: Lands on homepage → sees stats and "recently added" → clicks
"Get involved" → browses communities → maybe looks at a domain.
**Pain points**: Homepage is functional but not welcoming. No "start here"
for first-time visitors. Domain names can be jargony. Get-involved page
exists but could be more prominent. No guided tour.
**Features needed**: "Start here" onboarding section, guided tour, more
prominent get-involved CTA, domain explainers (exist), "new to NZ
tech-for-good?" section.

---

## Priority matrix

| Feature | Persona | Impact | Effort |
|---------|---------|--------|--------|
| Hiring/takes-contributors filter | Tāne, Māia | High | Low |
| Saved entries (bookmarks) | Tāne, Māia | High | Low |
| Citation generator | Aroha | Medium | Low |
| Methodology page | Aroha | Medium | Medium |
| "Similar orgs" widget | Hana | Medium | Low |
| "Start here" onboarding | Sam | High | Medium |
| Founding year filter | Aroha, James | Medium | Low |
| Skills taxonomy | Māia | Medium | High |
| Org claimed/verified badge | Hana | Low | High |
| Guided tour | Sam | Medium | High |
