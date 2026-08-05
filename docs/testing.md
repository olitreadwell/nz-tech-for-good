# Testing

This explains the test suite for `scripts/`: what each test type means in
this repo, where the tests live, and how to run them. It also covers how
to add tests for a new script.

The suite covers the Python scripts under `scripts/` only. The Astro site
under `site/` has its own, separate test suite.

## The three kinds of test

This repo uses three test types. Each one answers a different question.

### Unit tests

**Question: does this one function do the right thing, on its own?**

A unit test calls a single pure function directly, with plain Python
values in and an assertion on the return value out. No files, no
subprocess, no network. For example: `slugify("Te Hiku Media") ==
"te-hiku-media"`.

A few functions that only print to stdout (like `coverage.py`'s
`print_counts()`) are tested here too, using pytest's `capsys` fixture to
capture the printed text. They still don't touch the filesystem, the
network, or a subprocess, so they fit the same "no I/O" spirit as a pure
function.

Written as plain `pytest` functions and classes. No Gherkin: a unit test
like the `slugify` example above doesn't need a Given/When/Then story to
be readable.

**Location:** `tests/unit/`, one file per script (`test_validate.py`,
`test_dataquality.py`, and so on).

### Integration tests

**Question: do several parts of a script work correctly together, against
real-shaped data?**

An integration test builds fixture YAML files in a temporary directory
(using pytest's `tmp_path`), points the script's functions at that
directory, and checks the combined result. For example: write two entries
with the same name to a temp directory, call `dataquality.load_entries()`
then `dataquality.check_duplicates()`, and check the duplicate is
reported.

These run in-process: no subprocess is started. They call the script's
Python functions directly, with `monkeypatch` used to point module-level
paths like `ENTRIES_DIR` at the fixture directory instead of the real
`data/entries/`.

Written as **Gherkin** using `pytest-bdd`: a `.feature` file describes the
scenario in Given/When/Then steps, and a matching Python file implements
each step. This project chose formal Gherkin over lighter-weight
Given/When/Then comments, so keep using `pytest-bdd` for new integration
and smoke tests rather than switching styles.

**Location:** `tests/features/<script>.feature` for the scenarios, tagged
`@integration`. Step definitions live in `tests/steps/test_<script>_steps.py`.
Steps shared by more than one feature file (like "a fixture entries
directory") live in `tests/conftest.py` instead.

### Smoke tests

**Question: does the actual command-line tool work, end to end?**

A smoke test runs the real CLI as a subprocess (`subprocess.run([sys.executable,
"scripts/validate.py"], cwd=<fixture repo>)`), against fixture data, not
the live 150+ entry dataset. It checks the exit code and a few key lines
of stdout, the same way a human would eyeball a CI log.

Fixture repos for smoke tests are a full temporary copy of `scripts/` and
`schema/`, plus fixture entries: every script resolves its own paths from
`__file__`, not from the current working directory, so a subprocess run
against just a folder of YAML files would still read the real repo's
paths unless the whole small repo is copied.

Using fixture data (not the real dataset) means these tests keep working
as the directory grows: a smoke test shouldn't break just because someone
added entry number 153.

Also written as Gherkin, tagged `@smoke`. A feature file can mix
`@integration` and `@smoke` scenarios when they're about the same script
behaviour (see `tests/features/validate.feature`), or split into a
separate file when that reads better.

## Running the tests

```bash
# install test dependencies (once, or after requirements-dev.txt changes)
pip install -r requirements.txt -r requirements-dev.txt

# run everything
pytest

# run only one kind of test
pytest -m unit
pytest -m integration
pytest -m smoke

# run one script's tests
pytest tests/unit/test_dataquality.py
pytest tests/steps/test_dataquality_steps.py

# check coverage of scripts/, with a line-by-line report of what's missed
pytest --cov=scripts --cov-report=term-missing

# the same check CI runs, failing the build under 95% coverage
pytest --cov=scripts --cov-fail-under=95
```

`pytest.ini` settings live in `pyproject.toml` under
`[tool.pytest.ini_options]`. Coverage settings (which source directory to
measure, which lines to exclude) live in the same file under
`[tool.coverage.run]` and `[tool.coverage.report]`.

## Adding tests for a new script

Follow test-first / behaviour-first order: write the failing test before
the code that makes it pass.

1. **Write the `.feature` file first.** Describe the script's behaviour
   as Given/When/Then scenarios in `tests/features/<script>.feature`,
   covering both the happy path and the failure cases (missing field,
   bad input, empty directory, and so on). Tag each scenario
   `@integration` or `@smoke`.
2. **Watch it fail.** Run `pytest tests/features/` (or the specific
   feature) and confirm it fails, ideally with a clear "step not found"
   or `AssertionError`, not a crash. If pytest-bdd can't find a step
   definition yet, that's expected at this point.
3. **Write the step definitions** in `tests/steps/test_<script>_steps.py`,
   importing the script as a plain module (`import myscript`, since
   `scripts/` is on `sys.path` for tests, set up in `tests/conftest.py`).
   Reuse steps already defined in `conftest.py` (building a fixture repo,
   running a CLI command, checking an exit code) instead of duplicating
   them.
4. **Run it again and watch it pass.**
5. **Add unit tests** in `tests/unit/test_<script>.py` for the script's
   pure functions, if it has logic that doesn't need fixture files or a
   process boundary to test on its own.
6. **If the script's logic is stuck inside a `main()` or CLI block** with
   nothing extractable, pull the logic out into named functions first
   (small, behaviour-preserving refactor), the same way `build_guide.py`
   was split into `load_entries()`, `render_guide()`, and so on. Before
   committing a refactor like this, capture the script's current output
   against the real data (`python3 scripts/<script>.py > before.txt`),
   make the change, capture it again, and `diff` the two to confirm the
   output is unchanged. Scripts here are live in CI and this is a public
   repo, so a refactor must never change what a script prints or how it
   exits, only make its logic reachable from a test.
7. **Check coverage** with `pytest --cov=scripts --cov-report=term-missing`
   and add tests for anything genuinely missed. A line that truly can't
   be exercised (like an `except ImportError:` block that only runs when
   a dependency isn't installed) can carry a `# pragma: no cover` comment
   with a one-line reason, but don't reach for that to avoid testing real
   logic.

### A note on quoted step patterns

Step definitions in this suite use `pytest_bdd.parsers.re`, not
`parsers.parse`, for any step with a quoted argument (like `a valid entry
file "{filename}"`). `parsers.parse`'s default field type is greedy and
can swallow quote characters, so a short step pattern can wrongly match a
longer step's text when two patterns share a starting phrase. Anchoring
with a regex (`^...$`) and excluding quotes from each captured group
(`[^"]+`) avoids that. Keep using `parsers.re` for new quoted-argument
steps rather than switching back to `parsers.parse`.
