"""Step definitions for tests/features/validate.feature.

Step patterns are anchored regex (parsers.re), not parsers.parse: an
untyped parsers.parse field is greedy and can swallow quote characters,
so a short pattern like `a valid entry file "{filename}"` can wrongly
match a longer step's text (e.g. `... named "{name}"`) when several
patterns here share a literal prefix. Anchoring with ^...$ and excluding
quotes from each group ([^"]+) makes every pattern match only its own
exact step text.
"""

from pytest_bdd import given, parsers, scenarios, when

import validate
from conftest import default_name_for, make_entry, write_entry

scenarios("validate.feature")


@given(parsers.re(r'^a valid entry file "(?P<filename>[^"]+)"$'))
def _valid_entry_file(bdd_context, filename):
    write_entry(bdd_context["entries_dir"], filename, make_entry(name=default_name_for(filename)))


@given(parsers.re(r'^a valid entry file "(?P<filename>[^"]+)" named "(?P<name>[^"]+)"$'))
def _valid_entry_file_named(bdd_context, filename, name):
    write_entry(bdd_context["entries_dir"], filename, make_entry(name=name))


@given(parsers.re(r'^a valid entry file "(?P<filename>[^"]+)" with website "(?P<website>[^"]+)"$'))
def _valid_entry_file_with_website(bdd_context, filename, website):
    write_entry(
        bdd_context["entries_dir"], filename, make_entry(name=default_name_for(filename), website=website)
    )


@given(parsers.re(r'^an entry file "(?P<filename>[^"]+)" missing the "(?P<field>[^"]+)" field$'))
def _entry_file_missing_field(bdd_context, filename, field):
    entry = make_entry(name=default_name_for(filename))
    del entry[field]
    write_entry(bdd_context["entries_dir"], filename, entry)


@given(parsers.re(r'^an entry file "(?P<filename>[^"]+)" with domain "(?P<domain>[^"]+)"$'))
def _entry_file_with_domain(bdd_context, filename, domain):
    write_entry(bdd_context["entries_dir"], filename, make_entry(name=default_name_for(filename), domain=domain))


@given("a non-existent fixture entries directory")
def _non_existent_entries_dir(bdd_context, tmp_path):
    bdd_context["entries_dir"] = tmp_path / "does-not-exist"


@given(parsers.re(r'^an entry file "(?P<filename>[^"]+)" containing invalid YAML$'))
def _entry_file_invalid_yaml(bdd_context, filename):
    path = bdd_context["entries_dir"] / filename
    path.write_text("name: [unterminated\n", encoding="utf-8")


@given(parsers.re(r'^an entry file "(?P<filename>[^"]+)" containing a YAML list, not a mapping$'))
def _entry_file_yaml_list(bdd_context, filename):
    path = bdd_context["entries_dir"] / filename
    path.write_text("- one\n- two\n", encoding="utf-8")


@given("jsonschema is unavailable")
def _jsonschema_unavailable(bdd_context, monkeypatch):
    monkeypatch.setattr(validate, "jsonschema", None)


@when("I run validate.main() against the fixture directory")
def _run_validate_main(bdd_context, monkeypatch, capsys):
    monkeypatch.setattr(validate, "ENTRIES_DIR", bdd_context["entries_dir"])
    exit_code = validate.main()
    bdd_context["exit_code"] = exit_code
    bdd_context["output"] = capsys.readouterr().out
