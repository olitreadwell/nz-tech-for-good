"""Step definitions for tests/features/build_guide.feature.

Uses anchored regex step patterns (see test_validate_steps.py's module
docstring for why parsers.parse's greedy default field is unsafe here).
"""

from pytest_bdd import given, parsers, scenarios, then, when

import build_guide
from conftest import make_entry, write_entry

scenarios("build_guide.feature")


@given(
    parsers.re(
        r'^a valid entry file "(?P<filename>[^"]+)" named "(?P<name>[^"]+)" '
        r'in domain "(?P<domain>[^"]+)" related to "(?P<other>[^"]+)"$'
    )
)
def _valid_entry_named_in_domain_related_to(bdd_context, filename, name, domain, other):
    write_entry(bdd_context["entries_dir"], filename, make_entry(name=name, domain=domain, related_to=[other]))


@given(parsers.re(r'^a valid entry file "(?P<filename>[^"]+)" named "(?P<name>[^"]+)" in domain "(?P<domain>[^"]+)"$'))
def _valid_entry_named_in_domain(bdd_context, filename, name, domain):
    write_entry(bdd_context["entries_dir"], filename, make_entry(name=name, domain=domain))


@given(parsers.re(r'^a valid entry file "(?P<filename>[^"]+)" named "(?P<name>[^"]+)" related to "(?P<other>[^"]+)"$'))
def _valid_entry_related_to(bdd_context, filename, name, other):
    write_entry(bdd_context["entries_dir"], filename, make_entry(name=name, related_to=[other]))


@given(parsers.re(r'^a valid entry file "(?P<filename>[^"]+)" named "(?P<name>[^"]+)"$'))
def _valid_entry_named(bdd_context, filename, name):
    write_entry(bdd_context["entries_dir"], filename, make_entry(name=name))


@given(parsers.re(r'^a fully linked entry file "(?P<filename>[^"]+)" named "(?P<name>[^"]+)"$'))
def _fully_linked_entry(bdd_context, filename, name):
    write_entry(
        bdd_context["entries_dir"],
        filename,
        make_entry(
            name=name,
            website="https://example.org",
            github="https://github.com/example/example",
            linkedin_org="https://linkedin.com/company/example",
            tags=["civic tech", "open data"],
        ),
    )


@when("I build the guide from the fixture directory")
def _build_guide(bdd_context):
    entries, skipped = build_guide.load_entries(bdd_context["entries_dir"])
    text, stats = build_guide.render_guide(entries)
    bdd_context["guide_text"] = text
    bdd_context["guide_stats"] = stats
    bdd_context["skipped"] = skipped


@then(parsers.re(r'^the guide text contains "(?P<text>[^"]+)"$'))
def _guide_text_contains(bdd_context, text):
    assert text in bdd_context["guide_text"]


@then(parsers.re(r'^the guide text does not contain "(?P<text>[^"]+)"$'))
def _guide_text_does_not_contain(bdd_context, text):
    assert text not in bdd_context["guide_text"]


@then(parsers.parse("the guide stats total is {n:d}"))
def _guide_stats_total_is(bdd_context, n):
    assert bdd_context["guide_stats"]["total"] == n


@then("the guide stats unresolved refs is empty")
def _guide_stats_unresolved_refs_empty(bdd_context):
    assert bdd_context["guide_stats"]["unresolved_refs"] == []


@then(parsers.re(r'^the guide stats unresolved refs contains "(?P<text>[^"]+)"$'))
def _guide_stats_unresolved_refs_contains(bdd_context, text):
    refs = bdd_context["guide_stats"]["unresolved_refs"]
    assert any(text in ref_target for _source, ref_target in refs)


@then(parsers.re(r'^the fixture repo\'s GUIDE\.md contains "(?P<text>[^"]+)"$'))
def _fixture_repo_guide_contains(bdd_context, text):
    guide_path = bdd_context["repo"] / "GUIDE.md"
    assert text in guide_path.read_text(encoding="utf-8")


@when("I run build_guide.main() against the fixture directory")
def _run_build_guide_main(bdd_context, tmp_path, monkeypatch):
    out_path = tmp_path / "GUIDE.md"
    monkeypatch.setattr(build_guide, "ENTRIES_DIR", bdd_context["entries_dir"])
    monkeypatch.setattr(build_guide, "OUT", out_path)
    build_guide.main()
    bdd_context["written_guide_path"] = out_path


@then(parsers.re(r'^the written guide file contains "(?P<text>[^"]+)"$'))
def _written_guide_file_contains(bdd_context, text):
    assert text in bdd_context["written_guide_path"].read_text(encoding="utf-8")
