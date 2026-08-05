# Known gaps

## People / LinkedIn enrichment

No entry currently has `linkedin_people` filled in, even though the schema
supports it (`name`, `role`, `linkedin_url` per person). This isn't an
oversight in the data. It's a gap in the tooling used to build the
directory so far.

Finding accurate, current people-to-organisation links (e.g. "who is the
founder / who runs the tech team") reliably requires an authenticated
LinkedIn search tool, since public web search and unauthenticated scraping
return unreliable or stale results for this kind of query. That tooling
wasn't available when this directory was built.

**If you want to help close this gap:**

- Only add a person if you can verify their name, role, and LinkedIn URL
  against a real, current source (their own LinkedIn profile, or the
  organisation's team page).
- Follow the [People and privacy](../CONTRIBUTING.md#people-and-privacy)
  rules in CONTRIBUTING.md: public professional information only.
- Add entries to the `linkedin_people` list on the relevant YAML file, then
  run `scripts/validate.py` and `scripts/build_guide.py` as usual.
