# Research: how other sites turn a list into a community

This directory is good at listing groups. It is not yet good at helping a new user do something. Cases are joining a group, finding an event, meeting the people behind an entry, or sending a first pull request. This doc records what similar sites do about that. The roadmap items below are backed by real cases, not guesses.

Written 2026-08-06 as part of the improvement loop, at the user's request. A newcomer had asked "how do I get involved" and found no clear answer on this site.

## Comparable sites studied

### Civic Tech Field Guide (civictech.guide)

The closest match to this repo in scale and purpose: a hand-picked directory of 12,000+ tech-for-good projects and groups around the world. It is worth close study because it solves the exact problem this repo has.

What it does that this repo does not:

- **Four visible entry points on the homepage**, not just "browse the list": explore the directory, browse job resources, see upcoming events, browse open-source projects you can contribute to. Each is a distinct reason to visit, not just "look up an org."
- **An "Add a project" button**, prominent, not buried in a CONTRIBUTING.md link. Lowers the bar to contribute from "read docs, clone repo, write yaml" to "click a button, fill a form."
- **A dedicated directory category for community channels**: Slacks, Discords, and Teams are listed as first-class entries alongside organisations, not left implicit. See [directory.civictech.guide/listing-category/slacks-discords-teams](https://directory.civictech.guide/listing-category/slacks-discords-teams).
- **A blog and a podcast** ("Democracy Innovators"), so there is a reason to come back besides checking for new entries.
- **Social links to nine different platforms** on every page (GitHub, LinkedIn, Instagram, Mastodon, Threads, WhatsApp, Slack, Pinterest, Bluesky, YouTube), so people can follow in whatever channel they already use.
- **An interactive map**, so "what is near me" is a first-class way to browse, not just domain/region dropdowns.

### Tech for Good Organisers Network (techforgoodorganisers.uk)

A UK and Ireland network that links ten local "tech for good" meetup groups. Examples are Tech For Good London, TechSoup Connect, and Digital for Good Scotland. It matters because it shows a clear, easy way to join:

1. Email the coordinator saying you are interested.
2. Get added to the Slack workspace.
3. Get a calendar invite to the next monthly meetup.
4. Contribute at whatever level suits you. No minimum commitment.

That is the whole flow. Three steps, no application form, no interview.

### Digital Aotearoa Collective (digitalaotearoa.github.io/chat)

A real NZ group that is active now, not a guess.

"A civil society initiative to connect and welcome all people across Aotearoa New Zealand."

Its stated aim is "to dream and build better futures, together."

It runs a Slack workspace with a direct join link, no gate. It also runs a GitHub org (github.com/digitalaotearoa). So it is an open-source-friendly group this directory could likely link to or even work with.

**This is a candidate directory entry in its own right** (it is not currently in `data/entries/`).

### Tech for Good New Zealand (meetup.com/tech-for-good-new-zealand)

A real, active Auckland meetup group, part of the global NetSquared network (70+ cities). Events are free and open to charities, community groups, social businesses, tech workers, and digital marketers.

**Also a candidate directory entry**, not yet in `data/entries/`. It directly answers "where do I find the next event."

### Catchafire (catchafire.org)

A skills-volunteering marketplace. Nonprofits post short-term projects such as designing a logo, fixing a website, or reviewing a budget. People pick one up and complete it. The work is typically worth $5,000+ of donated advice time.

It is not a directory like this one. It is still relevant as a model for "give me a specific, bounded way to help," rather than "here is an org, good luck."

## What this means for this repo

This directory answers "what exists." It does not answer "what do I do next." The pattern across every similar site above is the same. Each offers a small number of clear, low-commitment next actions, not a wall of data.

The gap the user named breaks down into two parts. Some parts this repo can solve with data, such as adding real entries. The pipeline for that already works. Other parts need a design or product decision, such as a new page or a schema change. Those should go through the roadmap and get signed off, not get silently built by a loop iteration.

See the new items under "Community and engagement" in `docs/roadmap.md`. They list the work this research produced.
