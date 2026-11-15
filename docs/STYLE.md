# Style

Voice rules for the prose in this repo: `README.md`, `CONTRIBUTING.md`, `docs/*.md`, `GUIDE.md`, and the `what:` field in every entry. Facts, links, and org names are never rewritten to fit these rules. Only wording is.

## Hard rules

- **No em dashes.** Use a comma, a colon, parentheses, or a period and a new sentence instead. `scripts/stylecheck.py` fails the test gate on any em dash (`—`) in the files above.
- **No banned words.** Avoid the words in this list:

  ```text
  delve, intricate, tapestry, pivotal, underscore
  (as a verb), foster, testament, enhance, crucial, multifaceted, synergy,
  showcase, garner, robust, seamless, leverage, vibrant, thriving,
  world-class, cutting-edge, breathtaking, passionate, driven, enthusiastic.
  ```

`scripts/stylecheck.py` checks this list case-insensitively.
- **No puffery.** Do not call anything best in class or use a similar boast. State what the organisation does and let the fact carry the weight.
- **No rule-of-three padding.** Do not stretch a description into "adjective, adjective, and adjective" or "verb, verb, and verb" for rhythm. One accurate word beats three vague ones.
- **No vague `-ing` tails.** Do not close a sentence with an unsupported reflection like "reflecting its commitment to..." or "highlighting the shift toward...". An `-ing` clause is fine when it reports a real, named result (see the job-application style reference below). It is not fine as filler.
- **No negative parallelism.** Avoid "not just X, it is Y" and "not only... but...". State the fact once, directly.
- **No copula-avoidance.** Write "is," not "serves as" or "stands as."

## Register

This is directory and project-doc copy, not a cover letter. Keep it plain, specific, and calm:

- One entry `what:` field is one accurate sentence (or two short ones). Reorder or reword to fit the space. Never add a fact that is not already verified in the `source` field for the entry.
- Vary transitions. Do not lean on the same connector ("Additionally...", "It is worth noting...") across a document.
- Read it aloud. If it sounds performed or robotic, rewrite it.
- ESL- and AuDHD-friendly: short sentences, one idea per line, plain words where a plain word works.

## Where this comes from

This guide comes from the style guide used for job applications: Oli Treadwell's cover-letter and curriculum vitae style references.

The hard rules above (no em dashes, the banned-word list, no puffery) are the same list used there. The register changes for a public project doc.

## Checking it

```bash
python3 scripts/stylecheck.py
```

Runs in the test gate on every pull request (see `.github/workflows/ci.yml`). It checks `README.md`, `CONTRIBUTING.md`, `docs/*.md`, `GUIDE.md`, and every entry's `what:` field for em dashes and banned words, and fails the build if it finds any.
