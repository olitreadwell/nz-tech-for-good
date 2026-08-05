"""Unit tests for scripts/dataquality.py's pure functions."""

from datetime import date, timedelta
from pathlib import Path

import dataquality


class _FakePath:
    """Minimal stand-in for a pathlib.Path, exposing just .stem and .name."""

    def __init__(self, name):
        self.name = name
        self.stem = name.rsplit(".", 1)[0]


class TestSlugify:
    def test_lowercases_and_hyphenates(self):
        assert dataquality.slugify("Te Hiku Media") == "te-hiku-media"

    def test_drops_macrons(self):
        assert dataquality.slugify("Māori Data Sovereignty") == "maori-data-sovereignty"

    def test_collapses_punctuation_to_single_hyphen(self):
        assert dataquality.slugify("Access Matters Aotearoa (Access Alliance)") == "access-matters-aotearoa-access-alliance"

    def test_strips_leading_and_trailing_hyphens(self):
        assert dataquality.slugify("--Weird Name--") == "weird-name"

    def test_ampersand_becomes_hyphen(self):
        assert dataquality.slugify("Fish & Chips Co") == "fish-chips-co"


class TestNormaliseWebsite:
    def test_strips_scheme(self):
        assert dataquality.normalise_website("https://example.org") == "example.org"

    def test_strips_http_scheme(self):
        assert dataquality.normalise_website("http://example.org") == "example.org"

    def test_strips_www(self):
        assert dataquality.normalise_website("https://www.example.org") == "example.org"

    def test_strips_trailing_slash(self):
        assert dataquality.normalise_website("https://example.org/") == "example.org"

    def test_lowercases(self):
        assert dataquality.normalise_website("HTTPS://EXAMPLE.ORG") == "example.org"

    def test_empty_string_returns_none(self):
        assert dataquality.normalise_website("") is None

    def test_none_returns_none(self):
        assert dataquality.normalise_website(None) is None

    def test_combines_all_rules(self):
        assert dataquality.normalise_website("  HTTPS://WWW.Example.org/  ") == "example.org"


class TestLoadEntries:
    def test_skips_invalid_yaml(self, tmp_path, monkeypatch, capsys):
        (tmp_path / "broken.yaml").write_text("name: [unterminated\n", encoding="utf-8")
        monkeypatch.setattr(dataquality, "ENTRIES_DIR", tmp_path)
        entries = dataquality.load_entries()
        assert entries == []
        assert "could not parse YAML" in capsys.readouterr().out

    def test_skips_non_mapping_yaml(self, tmp_path, monkeypatch, capsys):
        (tmp_path / "list.yaml").write_text("- one\n- two\n", encoding="utf-8")
        monkeypatch.setattr(dataquality, "ENTRIES_DIR", tmp_path)
        entries = dataquality.load_entries()
        assert entries == []
        assert "not a YAML mapping" in capsys.readouterr().out

    def test_loads_valid_entries(self, tmp_path, monkeypatch):
        (tmp_path / "org-a.yaml").write_text("name: Org A\n", encoding="utf-8")
        monkeypatch.setattr(dataquality, "ENTRIES_DIR", tmp_path)
        entries = dataquality.load_entries()
        assert len(entries) == 1
        assert entries[0][1]["name"] == "Org A"


class TestCheckDuplicates:
    def test_no_duplicates_passes(self, capsys):
        entries = [
            (_FakePath("a.yaml"), {"name": "Org A", "website": "https://a.example.org"}),
            (_FakePath("b.yaml"), {"name": "Org B", "website": "https://b.example.org"}),
        ]
        assert dataquality.check_duplicates(entries) is False
        assert "pass  no duplicate" in capsys.readouterr().out

    def test_entry_without_a_name_is_ignored(self, capsys):
        entries = [(_FakePath("a.yaml"), {"website": "https://a.example.org"})]
        assert dataquality.check_duplicates(entries) is False

    def test_entry_without_a_website_is_ignored(self, capsys):
        entries = [(_FakePath("a.yaml"), {"name": "Org A"})]
        assert dataquality.check_duplicates(entries) is False

    def test_duplicate_name_is_fatal(self, capsys):
        entries = [
            (_FakePath("a.yaml"), {"name": "Org A"}),
            (_FakePath("b.yaml"), {"name": "org a"}),
        ]
        assert dataquality.check_duplicates(entries) is True
        assert "duplicate name" in capsys.readouterr().out

    def test_duplicate_website_is_fatal(self, capsys):
        entries = [
            (_FakePath("a.yaml"), {"name": "Org A", "website": "https://example.org"}),
            (_FakePath("b.yaml"), {"name": "Org B", "website": "https://www.example.org/"}),
        ]
        assert dataquality.check_duplicates(entries) is True
        assert "duplicate website" in capsys.readouterr().out


class TestCheckFreshness:
    def test_all_fresh_passes(self, capsys):
        entries = [(_FakePath("a.yaml"), {"name": "Org A", "last_verified": date.today().isoformat()})]
        dataquality.check_freshness(entries)
        assert "pass  all entries verified" in capsys.readouterr().out

    def test_missing_last_verified_is_stale(self, capsys):
        entries = [(_FakePath("a.yaml"), {"name": "Org A"})]
        dataquality.check_freshness(entries)
        out = capsys.readouterr().out
        assert "MISSING" in out

    def test_unparseable_last_verified_is_treated_as_missing(self, capsys):
        entries = [(_FakePath("a.yaml"), {"name": "Org A", "last_verified": "not-a-date"})]
        dataquality.check_freshness(entries)
        out = capsys.readouterr().out
        assert "MISSING" in out

    def test_old_last_verified_is_stale(self, capsys):
        old = (date.today() - timedelta(days=400)).isoformat()
        entries = [(_FakePath("a.yaml"), {"name": "Org A", "last_verified": old})]
        dataquality.check_freshness(entries)
        out = capsys.readouterr().out
        assert old in out


class TestCheckSlugs:
    def test_matching_slug_passes(self, capsys):
        entries = [(_FakePath("org-a.yaml"), {"name": "Org A"})]
        dataquality.check_slugs(entries)
        assert "pass  all filenames match" in capsys.readouterr().out

    def test_mismatched_slug_warns(self, capsys):
        entries = [(_FakePath("wrong-name.yaml"), {"name": "Org A"})]
        dataquality.check_slugs(entries)
        out = capsys.readouterr().out
        assert "filename/slug mismatches" in out

    def test_entry_without_a_name_is_skipped(self, capsys):
        entries = [(_FakePath("org-a.yaml"), {})]
        dataquality.check_slugs(entries)
        out = capsys.readouterr().out
        assert "pass  all filenames match" in out


class TestMain:
    def test_missing_entries_dir_is_an_error(self, tmp_path, monkeypatch, capsys):
        monkeypatch.setattr(dataquality, "ENTRIES_DIR", tmp_path / "does-not-exist")
        assert dataquality.main() == 1
        assert "does not exist" in capsys.readouterr().out

    def test_entries_dir_with_no_readable_yaml_is_an_error(self, tmp_path, monkeypatch, capsys):
        (tmp_path / "broken.yaml").write_text("name: [unterminated\n", encoding="utf-8")
        monkeypatch.setattr(dataquality, "ENTRIES_DIR", tmp_path)
        assert dataquality.main() == 1
        assert "no readable .yaml files found" in capsys.readouterr().out
