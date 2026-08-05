# Research: how other sites turn a list into a community

This directory is good at listing organisations. It is not yet good at
helping a newcomer do something: join a community, find an event, meet the
people behind an entry, or send their first pull request. This doc records
what comparable sites do about that, so the roadmap items below are backed
by real examples, not guesses.

Written 2026-08-06 as part of the improvement loop, at the user's request,
after a newcomer asked "how do I get involved" and found no clear answer on
this site.

## Comparable sites studied

### Civic Tech Field Guide (civictech.guide)

The closest match to this repo in scale and purpose: a curated directory of
12,000+ tech-for-good projects and organisations worldwide. Worth close
study because it solves the exact problem this repo has.

What it does that this repo doesn't:

- **Four visible entry points on the homepage**, not just "browse the
  list": explore the directory, browse job resources, see upcoming events,
  browse open-source projects you can contribute to. Each is a distinct
  reason to visit, not just "look up an org."
- **An "Add a project" button**, prominent, not buried in a CONTRIBUTING.md
  link. Lowers the bar to contribute from "read docs, clone repo, write
  YAML" to "click a button, fill a form."
- **A dedicated directory category for community channels**: Slacks,
  Discords, and Teams are listed as first-class entries alongside
  organisations, not left implicit. See
  [directory.civictech.guide/listing-category/slacks-discords-teams](https://directory.civictech.guide/listing-category/slacks-discords-teams).
- **A blog and a podcast** ("Democracy Innovators"), so there's a reason to
  come back besides checking for new entries.
- **Social links to nine different platforms** on every page (GitHub,
  LinkedIn, Instagram, Mastodon, Threads, WhatsApp, Slack, Pinterest,
  Bluesky, YouTube), so people can follow in whatever channel they already
  use.
- **An interactive map**, so "what's near me" is a first-class way to
  browse, not just domain/region dropdowns.

### Tech for Good Organisers Network (techforgoodorganisers.uk)

A UK/Ireland network connecting ten local "tech for good" meetup
communities (Tech For Good London, TechSoup Connect, Digital for Good
Scotland, and others). Relevant because it shows a concrete, low-friction
onboarding path:

1. Email the coordinator saying you're interested.
2. Get added to the Slack workspace.
3. Get a calendar invite to the next monthly meetup.
4. Contribute at whatever level suits you. No minimum commitment.

That's the whole flow. Three steps, no application form, no interview.

### Digital Aotearoa Collective (digitalaotearoa.github.io/chat)

A real, currently-active NZ community, not a hypothetical. "A civil society
initiative to connect and welcome all people across Aotearoa New Zealand to
dream and build better futures, together." Runs a Slack workspace with a
direct join link, no gatekeeping. Also runs a GitHub org
(github.com/digitalaotearoa), so it's an open-source-friendly community
this directory could plausibly link to or even collaborate with.

**This is a candidate directory entry in its own right** (it isn't
currently in `data/entries/`).

### Tech for Good New Zealand (meetup.com/tech-for-good-new-zealand)

A real, currently-active Auckland-based meetup group, part of the global
NetSquared network (70+ cities). Free events, open to charities, community
groups, social enterprises, tech professionals, and digital marketers.

**Also a candidate directory entry** (also not currently in
`data/entries/`). Directly answers "where do I find the next event."

### Catchafire (catchafire.org)

A skilled-volunteering marketplace: nonprofits post short-term projects
(design a logo, fix a website, review a budget), professionals pick one up
and complete it, typically worth $5,000+ of donated consulting time. Not a
directory like this one, but relevant as a model for "give me a specific,
bounded way to help," rather than "here's an org, good luck."

## What this means for this repo

This directory answers "what exists." It doesn't answer "what do I do next."
The pattern across every comparable site above is the same: a small number
of clear, low-commitment next actions, not a wall of information.

Concretely, the gap the user named breaks down into things this repo can
solve with data (add real entries, we already have a working pipeline for
that) and things that need a design/product decision (a new page, a schema
change) that should go through the roadmap and get signed off, not get
silently built by a loop iteration.

See the new items under "Community & engagement" in `docs/roadmap.md` for
the concrete backlog this produced.
