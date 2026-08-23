# Contributing

Thanks for helping grow this directory. There are two ways to contribute:
open an issue (no coding needed) or open a pull request.

## Option 1: suggest an entry via issue

Use the [add-an-entry issue form](../../issues/new?template=add-entry.yml).
Fill in what you know. Someone will verify it and add it as a pull request.

## Option 2: add an entry via pull request

### 1. Copy the template

```bash
cp data/entry.template.yaml data/entries/<slug>.yaml
```

`<slug>` is the organisation's name in lowercase, with spaces replaced by
hyphens, and macrons dropped from the filename only (keep macrons in the
content). For example, "Te Hiku Media" becomes
`data/entries/te-hiku-media.yaml`.

### 2. Fill in the fields

Open the new file and fill in each field. Required fields are `name`,
`domain`, `what`, `region`, and `source`. See the comments in
`data/entry.template.yaml` for what each field means.

**Domain:** reuse an existing domain from
[`schema/entry.schema.json`](schema/entry.schema.json) where it fits. Only
propose a new domain if none of the existing ones apply, and if you do,
you'll need to add it to the `enum` list in the schema too.

### 3. Verify, don't invent

Every fact in an entry must come from a live source: the organisation's own
website, its GitHub page, or its LinkedIn page. Put what you checked and how
in the `source` field, e.g.:

```yaml
source: "orgname.nz homepage, verified 2026-08-05"
```

If you don't know something (a founding year, whether they take
contributors, a careers page), leave it `null` or an empty string. Do not
guess. An empty field is honest; a guessed field is not.

### 4. Validate locally

```bash
python3 scripts/validate.py
```

This checks your new file (and every existing one) against the schema and
flags duplicate names or slugs. Fix anything it reports before continuing.

### 5. Regenerate the guide

```bash
python3 scripts/build_guide.py
```

This rebuilds `GUIDE.md` from all the YAML files. CI will fail your PR if
`GUIDE.md` is out of date, so always run this after adding or editing an
entry and commit the result.

### 6. Open a pull request

Include what you verified and how in the PR description.

## Updating an existing entry

Same flow: edit the YAML file, update `last_verified` to today's date, run
`scripts/validate.py` and `scripts/build_guide.py`, then open a PR.

## First-time contributors

Pull requests from new accounts are checked by a contributor gate before
they can merge. The gate looks at the GitHub account behind the PR and
fails the PR when the account is new or has no merged pull requests in
this repository. This stops bot and spam accounts from pushing entries
into the directory without a human decision.

A maintainer can override the gate by adding the `vetted-contributor`
label after a manual review. That review is the real decision. The gate
only stops automated merges, and a vetted account still has to pass the
normal validation and style checks.

If a PR looks like it was opened by a bot, a spammer, or an automated
account, it may be closed without review.

## People and privacy

Only include public professional information: something the organisation
or person has already made public (a company LinkedIn page, a named role on
a website). Don't add private contact details, personal social accounts, or
anything not already public.

If someone listed in this directory asks for their information to be
corrected or removed, open an issue and it will be actioned promptly. This
takes priority over completeness.

## Writing style

The `what:` field, and any other prose you add or edit (README, this file,
docs), follows the rules in [docs/STYLE.md](STYLE.md): no em dashes, no
banned puffery words. `python3 scripts/stylecheck.py` checks this and runs
in CI.

## Running the scripts

Both scripts need `pyyaml`; `validate.py` also uses `jsonschema` for full
schema checking (it degrades to a basic check if that's not installed).
Install both from `requirements.txt`:

```bash
pip install -r requirements.txt
python3 scripts/validate.py
python3 scripts/build_guide.py
python3 scripts/stylecheck.py
python3 scripts/linkcheck.py   # optional: checks all links for dead ones
```

`linkcheck.py` prefers [lychee](https://github.com/lycheeverse/lychee) if it
is installed, and falls back to a basic checker if not.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/) style,
plain language, one idea per line:

```
feat: add Te Hiku Media entry

- Added a new entry for Te Hiku Media in the iwi / Māori tech
  initiatives domain, verified against tehiku.nz.
```

Don't add a `Co-Authored-By` trailer for AI tools: the tool is a
facilitator, not a co-author.
