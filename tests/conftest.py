"""Shared pytest fixtures and pytest-bdd step definitions for the scripts/
test suite.

Puts scripts/ on sys.path so unit and integration tests can `import
validate`, `import dataquality`, etc. directly (the scripts have no
package __init__.py, they're standalone CLI modules). Smoke tests don't
use this for the script under test: they invoke a fixture repo copy as a
real subprocess instead.

Step definitions common to more than one .feature file (building fixture
data, running a script in-process or as a subprocess, asserting on exit
codes and output) live here so every feature file under tests/features/
can reuse them. Step definitions specific to one feature file live
alongside its scenarios() call in tests/steps/.
"""

import shutil
import subprocess
import sys
from pathlib import Path

import pytest
import yaml
from pytest_bdd import given, parsers, then, when

ROOT = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = ROOT / "scripts"
SCHEMA_PATH = ROOT / "schema" / "entry.schema.json"

if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))


def make_entry(**overrides):
    """A minimal, schema-valid entry dict. Pass keyword overrides to
    change or add fields for a specific test case."""
    entry = {
        "name": "Test Org",
        "domain": "civic-tech",
        "what": "Test Org does a test thing for the public good.",
        "region": "national",
        "website": "",
        "github": "",
        "linkedin_org": "",
        "linkedin_people": [],
        "tags": [],
        "related_to": [],
        "source": "test fixture, not a real source",
        "founding_year": None,
        "takes_contributors": None,
        "careers_url": "",
        "last_verified": "2026-08-01",
    }
    entry.update(overrides)
    return entry


def write_entry(entries_dir, filename, entry):
    """Write one entry dict as YAML to entries_dir/filename."""
    path = Path(entries_dir) / filename
    with open(path, "w", encoding="utf-8") as f:
        yaml.safe_dump(dict(entry), f, sort_keys=False, allow_unicode=True)
    return path


def default_name_for(filename):
    """A distinct, readable entry name derived from a fixture filename, so
    scenarios using several files don't collide on the same default name
    unless a scenario deliberately wants them to."""
    return Path(filename).stem.replace("-", " ").title()


@pytest.fixture
def entries_dir(tmp_path):
    """An empty data/entries-style directory for in-process integration
    tests. Scripts under test point their ENTRIES_DIR at this via
    monkeypatch."""
    d = tmp_path / "data" / "entries"
    d.mkdir(parents=True)
    return d


@pytest.fixture
def fixture_repo(tmp_path):
    """Build a standalone copy of the repo (scripts/ + schema/ + an empty
    data/entries/) under tmp_path, for smoke tests that run the CLI as a
    real subprocess. The scripts resolve their own paths from __file__,
    not cwd, so a full copy (not just fixture data) is required for a
    subprocess run to see fixture entries instead of the real dataset.
    """
    repo = tmp_path / "fixture-repo"
    (repo / "scripts").mkdir(parents=True)
    (repo / "schema").mkdir(parents=True)
    (repo / "data" / "entries").mkdir(parents=True)
    (repo / "data" / "exports").mkdir(parents=True)
    (repo / "docs").mkdir(parents=True)

    for py in SCRIPTS_DIR.glob("*.py"):
        shutil.copy2(py, repo / "scripts" / py.name)
    shutil.copy2(SCHEMA_PATH, repo / "schema" / "entry.schema.json")

    (repo / "README.md").write_text("# Fixture repo\n", encoding="utf-8")
    (repo / "CONTRIBUTING.md").write_text("# Contributing\n", encoding="utf-8")
    (repo / "GUIDE.md").write_text("# Guide\n", encoding="utf-8")
    (repo / "docs" / "STYLE.md").write_text("# Style\n", encoding="utf-8")

    return repo


# ---------------------------------------------------------------------------
# pytest-bdd: shared context and step definitions
# ---------------------------------------------------------------------------


@pytest.fixture
def bdd_context():
    """A plain dict scenarios use to pass state between Given/When/Then
    steps (fixture files created, exit codes, captured output, ...)."""
    return {}


@given("a fixture entries directory")
def _given_fixture_entries_dir(bdd_context, entries_dir):
    bdd_context["entries_dir"] = entries_dir


@given(parsers.re(r'^a fixture repo with one valid entry "(?P<filename>[^"]+)"$'))
def _given_fixture_repo_one_valid_entry(bdd_context, fixture_repo, filename):
    write_entry(fixture_repo / "data" / "entries", filename, make_entry(name=default_name_for(filename)))
    bdd_context["repo"] = fixture_repo


@given(parsers.re(r'^a fixture repo with an entry "(?P<filename>[^"]+)" missing the "(?P<field>[^"]+)" field$'))
def _given_fixture_repo_entry_missing_field(bdd_context, fixture_repo, filename, field):
    entry = make_entry(name=default_name_for(filename))
    del entry[field]
    write_entry(fixture_repo / "data" / "entries", filename, entry)
    bdd_context["repo"] = fixture_repo


@when(parsers.re(r'^I run "(?P<script>[^"]+)" in the fixture repo$'))
def _when_run_script_in_fixture_repo(bdd_context, script):
    repo = bdd_context["repo"]
    result = subprocess.run(
        [sys.executable, str(repo / script)],
        cwd=repo,
        capture_output=True,
        text=True,
        timeout=30,
    )
    bdd_context["returncode"] = result.returncode
    bdd_context["stdout"] = result.stdout
    bdd_context["stderr"] = result.stderr


@then(parsers.parse("the process exit code is {code:d}"))
def _then_process_exit_code_is(bdd_context, code):
    assert bdd_context["returncode"] == code, (
        f"expected exit {code}, got {bdd_context['returncode']}\n"
        f"stdout:\n{bdd_context['stdout']}\nstderr:\n{bdd_context['stderr']}"
    )


@then(parsers.re(r'^stdout contains "(?P<text>[^"]+)"$'))
def _then_stdout_contains(bdd_context, text):
    assert text in bdd_context["stdout"], f"{text!r} not found in stdout:\n{bdd_context['stdout']}"


@then(parsers.re(r'^stdout does not contain "(?P<text>[^"]+)"$'))
def _then_stdout_does_not_contain(bdd_context, text):
    assert text not in bdd_context["stdout"], f"{text!r} unexpectedly found in stdout:\n{bdd_context['stdout']}"


@then(parsers.parse("the exit code is {code:d}"))
def _then_exit_code_is(bdd_context, code):
    assert bdd_context["exit_code"] == code, (
        f"expected exit {code}, got {bdd_context['exit_code']}\noutput:\n{bdd_context.get('output', '')}"
    )


@then(parsers.re(r'^the output contains "(?P<text>[^"]+)"$'))
def _then_output_contains(bdd_context, text):
    assert text in bdd_context["output"], f"{text!r} not found in output:\n{bdd_context['output']}"


@then(parsers.re(r'^the output does not contain "(?P<text>[^"]+)"$'))
def _then_output_does_not_contain(bdd_context, text):
    assert text not in bdd_context["output"], f"{text!r} unexpectedly found in output:\n{bdd_context['output']}"
