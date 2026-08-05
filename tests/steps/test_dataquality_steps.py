"""Step definitions for tests/features/dataquality.feature.

Uses anchored regex step patterns (see test_validate_steps.py's module
docstring for why parsers.parse's greedy default field is unsafe here).
"""

from datetime import date

from pytest_bdd import given, parsers, scenarios, when

import dataquality
from conftest import default_name_for, make_entry, write_entry

scenarios("dataquality.feature")


@given(parsers.re(r'^a valid entry file "(?P<filename>[^"]+)" named "(?P<name>[^"]+)"$'))
def _valid_entry_named(bdd_context, filename, name):
    write_entry(bdd_context["entries_dir"], filename, make_entry(name=name))


@given(parsers.re(r'^a valid entry file "(?P<filename>[^"]+)" with website "(?P<website>[^"]+)"$'))
def _valid_entry_with_website(bdd_context, filename, website):
    write_entry(
        bdd_context["entries_dir"], filename, make_entry(name=default_name_for(filename), website=website)
    )


@given(parsers.re(r'^a valid entry file "(?P<filename>[^"]+)" last verified on "(?P<when>[^"]+)"$'))
def _valid_entry_last_verified(bdd_context, filename, when):
    write_entry(
        bdd_context["entries_dir"],
        filename,
        make_entry(name=default_name_for(filename), last_verified=when),
    )


@given(parsers.re(r'^an entry file "(?P<filename>[^"]+)" missing the "(?P<field>[^"]+)" field$'))
def _entry_missing_field(bdd_context, filename, field):
    entry = make_entry(name=default_name_for(filename))
    del entry[field]
    write_entry(bdd_context["entries_dir"], filename, entry)


@given(parsers.re(r'^a valid entry file "(?P<filename>[^"]+)" named "(?P<name>[^"]+)" verified today$'))
def _valid_entry_named_verified_today(bdd_context, filename, name):
    write_entry(
        bdd_context["entries_dir"],
        filename,
        make_entry(name=name, last_verified=date.today().isoformat()),
    )


@given(parsers.re(r'^a fixture repo with two entries named "(?P<name>[^"]+)"$'))
def _fixture_repo_two_entries_named(bdd_context, fixture_repo, name):
    write_entry(fixture_repo / "data" / "entries", "org-a.yaml", make_entry(name=name))
    write_entry(fixture_repo / "data" / "entries", "org-b.yaml", make_entry(name=name))
    bdd_context["repo"] = fixture_repo


@when("I run dataquality.main() against the fixture directory")
def _run_dataquality_main(bdd_context, monkeypatch, capsys):
    monkeypatch.setattr(dataquality, "ENTRIES_DIR", bdd_context["entries_dir"])
    exit_code = dataquality.main()
    bdd_context["exit_code"] = exit_code
    bdd_context["output"] = capsys.readouterr().out
