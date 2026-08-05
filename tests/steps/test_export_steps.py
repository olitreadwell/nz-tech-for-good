"""Step definitions for tests/features/export.feature.

Uses anchored regex step patterns (see test_validate_steps.py's module
docstring for why parsers.parse's greedy default field is unsafe here).
"""

import csv

from pytest_bdd import given, parsers, scenarios, then, when

import export
from conftest import make_entry, write_entry

scenarios("export.feature")


@given(parsers.re(r'^a valid entry file "(?P<filename>[^"]+)" named "(?P<name>[^"]+)" with tags "(?P<tags>[^"]+)"$'))
def _valid_entry_named_with_tags(bdd_context, filename, name, tags):
    write_entry(bdd_context["entries_dir"], filename, make_entry(name=name, tags=[t.strip() for t in tags.split(",")]))


@given(parsers.re(r'^a valid entry file "(?P<filename>[^"]+)" named "(?P<name>[^"]+)"$'))
def _valid_entry_named(bdd_context, filename, name):
    write_entry(bdd_context["entries_dir"], filename, make_entry(name=name))


@given(parsers.re(r'^an entry file "(?P<filename>[^"]+)" missing the "(?P<field>[^"]+)" field$'))
def _entry_missing_field(bdd_context, filename, field):
    entry = make_entry(name="Placeholder")
    del entry[field]
    write_entry(bdd_context["entries_dir"], filename, entry)


@when("I load and export entries from the fixture directory")
def _load_entries(bdd_context, monkeypatch):
    monkeypatch.setattr(export, "ENTRIES_DIR", bdd_context["entries_dir"])
    entries, skipped = export.load_entries()
    bdd_context["entries"] = entries
    bdd_context["skipped"] = skipped


@when("I write the CSV export")
def _write_csv(bdd_context, tmp_path, monkeypatch):
    csv_path = tmp_path / "entries.csv"
    monkeypatch.setattr(export, "CSV_OUT", csv_path)
    export.write_csv(bdd_context["entries"])
    bdd_context["csv_path"] = csv_path


@then(parsers.re(r'^the exported entries include "(?P<name>[^"]+)"$'))
def _exported_entries_include(bdd_context, name):
    assert any(e["name"] == name for e in bdd_context["entries"])


@then("the first exported entry has fields in the fixed field order")
def _first_entry_field_order(bdd_context):
    assert list(bdd_context["entries"][0].keys()) == export.FIELDS


@then(parsers.parse("{n:d} entry was skipped"))
def _n_entries_skipped(bdd_context, n):
    assert bdd_context["skipped"] == n


@then(parsers.re(r'^the CSV row for "(?P<name>[^"]+)" has tags "(?P<tags>[^"]*)"$'))
def _csv_row_has_tags(bdd_context, name, tags):
    with open(bdd_context["csv_path"], encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))
    matching = [r for r in rows if r["name"] == name]
    assert matching, f"no CSV row found for {name!r}"
    assert matching[0]["tags"] == tags


@then(parsers.re(r"^the fixture repo's exports/entries\.json contains \"(?P<text>[^\"]+)\"$"))
def _fixture_repo_exports_json_contains(bdd_context, text):
    json_path = bdd_context["repo"] / "data" / "exports" / "entries.json"
    assert text in json_path.read_text(encoding="utf-8")
