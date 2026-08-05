"""Unit tests for scripts/export.py's pure functions, plus load_entries()
and main() exercised against a tmp_path fixture directory (monkeypatched
module paths, no subprocess)."""

import json

import export


class TestBoolOrBlank:
    def test_true_becomes_string_true(self):
        assert export.bool_or_blank(True) == "true"

    def test_false_becomes_string_false(self):
        assert export.bool_or_blank(False) == "false"

    def test_none_becomes_empty_string(self):
        assert export.bool_or_blank(None) == ""


class TestToRow:
    def base_entry(self, **overrides):
        entry = {field: export.DEFAULTS.get(field) for field in export.FIELDS}
        entry["name"] = "Test Org"
        entry["domain"] = "civic-tech"
        entry["what"] = "Does a thing."
        entry["region"] = "national"
        entry["source"] = "test"
        entry.update(overrides)
        return entry

    def test_joins_tags_with_semicolon(self):
        row = export.to_row(self.base_entry(tags=["a", "b", "c"]))
        assert row["tags"] == "a; b; c"

    def test_empty_tags_becomes_empty_string(self):
        row = export.to_row(self.base_entry(tags=[]))
        assert row["tags"] == ""

    def test_joins_related_to_with_semicolon(self):
        row = export.to_row(self.base_entry(related_to=["Org A", "Org B"]))
        assert row["related_to"] == "Org A; Org B"

    def test_formats_linkedin_people(self):
        entry = self.base_entry(
            linkedin_people=[{"name": "Jane Doe", "role": "Founder", "linkedin_url": "https://linkedin.com/in/jane"}]
        )
        row = export.to_row(entry)
        assert row["linkedin_people"] == "Jane Doe (Founder): https://linkedin.com/in/jane"

    def test_multiple_linkedin_people_joined_with_semicolon(self):
        entry = self.base_entry(
            linkedin_people=[
                {"name": "Jane Doe", "role": "Founder", "linkedin_url": "https://linkedin.com/in/jane"},
                {"name": "John Smith", "role": "CTO", "linkedin_url": "https://linkedin.com/in/john"},
            ]
        )
        row = export.to_row(entry)
        assert row["linkedin_people"] == (
            "Jane Doe (Founder): https://linkedin.com/in/jane; "
            "John Smith (CTO): https://linkedin.com/in/john"
        )

    def test_founding_year_none_becomes_empty_string(self):
        row = export.to_row(self.base_entry(founding_year=None))
        assert row["founding_year"] == ""

    def test_founding_year_int_passes_through(self):
        row = export.to_row(self.base_entry(founding_year=2020))
        assert row["founding_year"] == 2020

    def test_takes_contributors_true(self):
        row = export.to_row(self.base_entry(takes_contributors=True))
        assert row["takes_contributors"] == "true"

    def test_takes_contributors_none(self):
        row = export.to_row(self.base_entry(takes_contributors=None))
        assert row["takes_contributors"] == ""


class TestLoadEntries:
    def test_skips_invalid_yaml(self, tmp_path, monkeypatch):
        (tmp_path / "broken.yaml").write_text("name: [unterminated\n", encoding="utf-8")
        monkeypatch.setattr(export, "ENTRIES_DIR", tmp_path)
        entries, skipped = export.load_entries()
        assert entries == []
        assert skipped == 1

    def test_skips_entry_without_name(self, tmp_path, monkeypatch):
        (tmp_path / "noname.yaml").write_text("domain: civic-tech\n", encoding="utf-8")
        monkeypatch.setattr(export, "ENTRIES_DIR", tmp_path)
        entries, skipped = export.load_entries()
        assert entries == []
        assert skipped == 1


class TestMain:
    def test_missing_entries_dir_is_an_error(self, tmp_path, monkeypatch, capsys):
        monkeypatch.setattr(export, "ENTRIES_DIR", tmp_path / "does-not-exist")
        assert export.main() == 1
        assert "does not exist" in capsys.readouterr().out

    def test_no_valid_entries_is_an_error(self, tmp_path, monkeypatch, capsys):
        (tmp_path / "broken.yaml").write_text("name: [unterminated\n", encoding="utf-8")
        monkeypatch.setattr(export, "ENTRIES_DIR", tmp_path)
        assert export.main() == 1
        assert "no valid entries found" in capsys.readouterr().out

    def test_writes_json_and_csv_and_exits_0(self, tmp_path, monkeypatch, capsys):
        entries_dir = tmp_path / "entries"
        entries_dir.mkdir()
        (entries_dir / "org-a.yaml").write_text(
            "name: Org A\ndomain: civic-tech\nwhat: Does a thing.\nregion: national\nsource: test\n",
            encoding="utf-8",
        )
        exports_dir = tmp_path / "exports"
        monkeypatch.setattr(export, "ENTRIES_DIR", entries_dir)
        monkeypatch.setattr(export, "EXPORTS_DIR", exports_dir)
        monkeypatch.setattr(export, "JSON_OUT", exports_dir / "entries.json")
        monkeypatch.setattr(export, "CSV_OUT", exports_dir / "entries.csv")

        assert export.main() == 0

        out = capsys.readouterr().out
        assert "total entries 1" in out
        assert "skipped invalid files: 0" in out

        written = json.loads((exports_dir / "entries.json").read_text(encoding="utf-8"))
        assert written[0]["name"] == "Org A"
        assert (exports_dir / "entries.csv").exists()
