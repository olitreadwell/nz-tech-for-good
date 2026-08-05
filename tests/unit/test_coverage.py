"""Unit tests for scripts/coverage.py.

print_counts() and print_thin_domains() only write to stdout (captured
via capsys) — no filesystem or network I/O — so they're tested here
alongside the fully pure functions.

Loaded via importlib under the alias "coverage_script" rather than
`import coverage`: a plain import would collide with the real `coverage`
package pytest-cov depends on, since scripts/ is on sys.path.
"""

import importlib.util
from collections import Counter
from pathlib import Path

_SCRIPT_PATH = Path(__file__).resolve().parent.parent.parent / "scripts" / "coverage.py"
_spec = importlib.util.spec_from_file_location("coverage_script", _SCRIPT_PATH)
coverage_script = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(coverage_script)


class TestPrintCounts:
    def test_prints_title_and_counts_most_common_first(self, capsys):
        counts = Counter({"civic-tech": 5, "open-data": 10})
        coverage_script.print_counts("Entries per domain", counts)
        out = capsys.readouterr().out
        assert "== Entries per domain ==" in out
        lines = [line for line in out.splitlines() if "entries" in line or "entry" in line]
        assert lines[0].strip().startswith("open-data")

    def test_empty_counts_prints_none(self, capsys):
        coverage_script.print_counts("Entries per region", Counter())
        out = capsys.readouterr().out
        assert "(none)" in out

    def test_singular_noun_for_count_of_one(self, capsys):
        coverage_script.print_counts("Entries per domain", Counter({"civic-tech": 1}))
        out = capsys.readouterr().out
        assert "1 entry" in out
        assert "1 entries" not in out


class TestPrintThinDomains:
    def test_domain_with_zero_entries_is_flagged(self, capsys):
        valid_domains = ["civic-tech", "open-data"]
        domain_counts = Counter({"civic-tech": 5})
        coverage_script.print_thin_domains(domain_counts, valid_domains)
        out = capsys.readouterr().out
        assert "open-data: 0 entries" in out

    def test_domain_at_or_above_threshold_not_flagged(self, capsys):
        valid_domains = ["civic-tech"]
        domain_counts = Counter({"civic-tech": 3})
        coverage_script.print_thin_domains(domain_counts, valid_domains)
        out = capsys.readouterr().out
        assert "civic-tech" not in out.split("==")[-1]

    def test_domain_below_threshold_is_flagged(self, capsys):
        valid_domains = ["civic-tech"]
        domain_counts = Counter({"civic-tech": 2})
        coverage_script.print_thin_domains(domain_counts, valid_domains)
        out = capsys.readouterr().out
        assert "civic-tech: 2 entries" in out

    def test_no_thin_domains_prints_none_message(self, capsys):
        valid_domains = ["civic-tech"]
        domain_counts = Counter({"civic-tech": 10})
        coverage_script.print_thin_domains(domain_counts, valid_domains)
        out = capsys.readouterr().out
        assert "none, every domain has at least" in out

    def test_sorted_by_count_then_name(self, capsys):
        valid_domains = ["zebra-domain", "civic-tech"]
        domain_counts = Counter()
        coverage_script.print_thin_domains(domain_counts, valid_domains)
        out = capsys.readouterr().out
        body = out.split("==")[-1]
        assert body.index("civic-tech") < body.index("zebra-domain")


class TestLoadValidDomains:
    def test_returns_domain_enum_from_schema(self):
        domains = coverage_script.load_valid_domains()
        assert "civic-tech" in domains
        assert "open-data" in domains
        assert isinstance(domains, list)


class TestLoadEntries:
    def test_skips_invalid_yaml(self, tmp_path, monkeypatch, capsys):
        (tmp_path / "broken.yaml").write_text("name: [unterminated\n", encoding="utf-8")
        monkeypatch.setattr(coverage_script, "ENTRIES_DIR", tmp_path)
        entries = coverage_script.load_entries()
        assert entries == []
        assert "could not parse YAML" in capsys.readouterr().out

    def test_skips_non_mapping_yaml(self, tmp_path, monkeypatch, capsys):
        (tmp_path / "list.yaml").write_text("- one\n- two\n", encoding="utf-8")
        monkeypatch.setattr(coverage_script, "ENTRIES_DIR", tmp_path)
        entries = coverage_script.load_entries()
        assert entries == []
        assert "not a YAML mapping" in capsys.readouterr().out

    def test_loads_valid_entries(self, tmp_path, monkeypatch):
        (tmp_path / "org-a.yaml").write_text("name: Org A\ndomain: civic-tech\n", encoding="utf-8")
        monkeypatch.setattr(coverage_script, "ENTRIES_DIR", tmp_path)
        entries = coverage_script.load_entries()
        assert len(entries) == 1
        assert entries[0]["name"] == "Org A"


class TestMain:
    def test_missing_entries_dir_exits_0_with_error_message(self, tmp_path, monkeypatch, capsys):
        monkeypatch.setattr(coverage_script, "ENTRIES_DIR", tmp_path / "does-not-exist")
        assert coverage_script.main() == 0
        assert "does not exist" in capsys.readouterr().out
