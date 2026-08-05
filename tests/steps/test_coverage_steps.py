"""Step definitions for tests/features/coverage.feature.

scripts/coverage.py is loaded via importlib under the alias
"coverage_script": a plain `import coverage` would collide with the real
`coverage` package that pytest-cov depends on, since scripts/ is on
sys.path.
"""

import importlib.util
from pathlib import Path

from pytest_bdd import given, parsers, scenarios, when

from conftest import SCRIPTS_DIR, make_entry, write_entry

scenarios("coverage.feature")

_spec = importlib.util.spec_from_file_location("coverage_script", SCRIPTS_DIR / "coverage.py")
coverage_script = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(coverage_script)


@given(parsers.re(r'^a valid entry file "(?P<filename>[^"]+)" named "(?P<name>[^"]+)" in domain "(?P<domain>[^"]+)"$'))
def _valid_entry_in_domain(bdd_context, filename, name, domain):
    write_entry(bdd_context["entries_dir"], filename, make_entry(name=name, domain=domain))


@given(parsers.re(r'^a valid entry file "(?P<filename>[^"]+)" named "(?P<name>[^"]+)" in region "(?P<region>[^"]+)"$'))
def _valid_entry_in_region(bdd_context, filename, name, region):
    write_entry(bdd_context["entries_dir"], filename, make_entry(name=name, region=region))


@when("I run coverage.main() against the fixture directory")
def _run_coverage_main(bdd_context, monkeypatch, capsys):
    monkeypatch.setattr(coverage_script, "ENTRIES_DIR", bdd_context["entries_dir"])
    exit_code = coverage_script.main()
    bdd_context["exit_code"] = exit_code
    bdd_context["output"] = capsys.readouterr().out
