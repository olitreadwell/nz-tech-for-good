"""Step definitions for tests/features/stylecheck.feature.

Uses anchored regex step patterns (see test_validate_steps.py's module
docstring for why parsers.parse's greedy default field is unsafe here).
"""

from pytest_bdd import given, parsers, scenarios, when

import stylecheck
from conftest import make_entry, write_entry

scenarios("stylecheck.feature")

_FILE_KEYS = {
    "README.md": "readme",
    "CONTRIBUTING.md": "contributing",
    "GUIDE.md": "guide",
    "docs/STYLE.md": "style_doc",
}


@given("a fixture prose repo")
def _fixture_prose_repo(bdd_context, tmp_path):
    root = tmp_path / "prose-repo"
    (root / "docs").mkdir(parents=True)
    (root / "data" / "entries").mkdir(parents=True)

    readme = root / "README.md"
    contributing = root / "CONTRIBUTING.md"
    guide = root / "GUIDE.md"
    style_doc = root / "docs" / "STYLE.md"
    for path in (readme, contributing, guide, style_doc):
        path.write_text("This is a clean, plain line.\n", encoding="utf-8")

    bdd_context.update(
        {
            "root": root,
            "readme": readme,
            "contributing": contributing,
            "guide": guide,
            "style_doc": style_doc,
            "entries_dir": root / "data" / "entries",
        }
    )


@given(parsers.re(r'^"(?P<filename>[^"]+)" contains an em dash and the word "(?P<word>[^"]+)"$'))
def _file_contains_em_dash_and_word(bdd_context, filename, word):
    path = bdd_context[_FILE_KEYS[filename]]
    path.write_text(
        path.read_text(encoding="utf-8") + f"A line with an em dash — and the word {word}.\n",
        encoding="utf-8",
    )


@given(parsers.re(r'^"(?P<filename>[^"]+)" contains an em dash$'))
def _file_contains_em_dash(bdd_context, filename):
    path = bdd_context[_FILE_KEYS[filename]]
    path.write_text(path.read_text(encoding="utf-8") + "A line with an em dash — right there.\n", encoding="utf-8")


@given(parsers.re(r'^an entry "(?P<filename>[^"]+)" whose what field contains "(?P<word>[^"]+)"$'))
def _entry_what_contains_word(bdd_context, filename, word):
    entry = make_entry(name="Fixture Org", what=f"This organisation will {word} great outcomes.")
    write_entry(bdd_context["entries_dir"], filename, entry)


@given(parsers.re(r'^an entry "(?P<filename>[^"]+)" whose source field contains "(?P<word>[^"]+)"$'))
def _entry_source_contains_word(bdd_context, filename, word):
    entry = make_entry(name="Fixture Org", source=f"Verified via a source that will {word} results.")
    write_entry(bdd_context["entries_dir"], filename, entry)


@given(parsers.re(r'^an entry "(?P<filename>[^"]+)" named "(?P<name>[^"]+)"$'))
def _entry_named(bdd_context, filename, name):
    write_entry(bdd_context["entries_dir"], filename, make_entry(name=name))


@given(parsers.re(r'^"(?P<filename>[^"]+)" mentions the entry name "(?P<name>[^"]+)"$'))
def _file_mentions_entry_name(bdd_context, filename, name):
    path = bdd_context[_FILE_KEYS[filename]]
    path.write_text(path.read_text(encoding="utf-8") + f"See {name} for details.\n", encoding="utf-8")


@when("I run stylecheck.main() against the fixture repo")
def _run_stylecheck_main(bdd_context, monkeypatch, capsys):
    monkeypatch.setattr(stylecheck, "ENTRIES_DIR", bdd_context["entries_dir"])
    monkeypatch.setattr(stylecheck, "ROOT", bdd_context["root"])
    docs_dir = bdd_context["root"] / "docs"
    prose_files = [bdd_context["readme"], bdd_context["contributing"], bdd_context["guide"]] + sorted(
        p for p in docs_dir.glob("*.md") if p != bdd_context["style_doc"]
    )
    monkeypatch.setattr(stylecheck, "PROSE_FILES", prose_files)

    exit_code = stylecheck.main()
    bdd_context["exit_code"] = exit_code
    bdd_context["output"] = capsys.readouterr().out


@given(parsers.re(r'^"(?P<filename>[^"]+)" in the fixture repo contains the word "(?P<word>[^"]+)"$'))
def _fixture_repo_file_contains_word(bdd_context, filename, word):
    path = bdd_context["repo"] / filename
    path.write_text(path.read_text(encoding="utf-8") + f"This will {word} into the wrong thing.\n", encoding="utf-8")
