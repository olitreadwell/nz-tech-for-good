"""Unit tests for scripts/stylecheck.py's pure functions."""

import stylecheck


class TestCheckText:
    def test_em_dash_is_flagged(self):
        violations = []
        stylecheck.check_text("doc.md", "This uses an em dash — right here.", violations)
        assert len(violations) == 1
        assert violations[0][2] == "em dash"

    def test_banned_word_is_flagged_case_insensitively(self):
        violations = []
        stylecheck.check_text("doc.md", "We must LEVERAGE this opportunity.", violations)
        assert len(violations) == 1
        assert violations[0][2].lower() == "banned word 'leverage'"

    def test_banned_word_matched_as_whole_word_only(self):
        violations = []
        # "leverages" contains "leverage" as a substring but not a whole word
        # match once pluralised — the pattern must still catch it since \b
        # only requires a word boundary, not an exact token; verify the
        # boundary doesn't over-match inside an unrelated word instead.
        stylecheck.check_text("doc.md", "The wordfostering has foster inside it.", violations)
        kinds = [v[2] for v in violations]
        assert any("foster" in k for k in kinds)
        # "wordfostering" should not itself trigger a second, spurious hit
        assert kinds.count("banned word 'foster'") == 1

    def test_clean_line_has_no_violations(self):
        violations = []
        stylecheck.check_text("doc.md", "This is a plain, clear sentence.", violations)
        assert violations == []

    def test_known_entry_name_with_em_dash_is_not_flagged(self):
        violations = []
        text = "NZ On Air — Public Interest Journalism Fund is listed here."
        stylecheck.check_text(
            "doc.md", text, violations, known_names=["NZ On Air — Public Interest Journalism Fund"]
        )
        assert violations == []

    def test_em_dash_outside_known_name_is_still_flagged(self):
        violations = []
        text = "NZ On Air — Public Interest Journalism Fund does great work — really."
        stylecheck.check_text(
            "doc.md", text, violations, known_names=["NZ On Air — Public Interest Journalism Fund"]
        )
        assert len(violations) == 1

    def test_line_number_recorded(self):
        violations = []
        stylecheck.check_text("doc.md", "line one\nline two has an em dash —\n", violations)
        assert violations[0][1] == 2

    def test_multiple_banned_words_on_one_line_all_flagged(self):
        violations = []
        stylecheck.check_text("doc.md", "This is robust and seamless.", violations)
        kinds = {v[2] for v in violations}
        assert "banned word 'robust'" in kinds
        assert "banned word 'seamless'" in kinds


class TestLoadKnownNames:
    def test_returns_names_sorted_longest_first(self):
        entries = [
            (None, {"name": "Short"}),
            (None, {"name": "A Much Longer Organisation Name"}),
        ]
        names = stylecheck.load_known_names(entries)
        assert names[0] == "A Much Longer Organisation Name"

    def test_skips_entries_without_a_name(self):
        entries = [(None, {"name": ""}), (None, {"domain": "civic-tech"})]
        assert stylecheck.load_known_names(entries) == []


class TestCheckEntries:
    def test_flags_banned_word_in_what_field(self):
        entries = [(_FakePath("org.yaml"), {"name": "Org", "what": "This is a robust solution."})]
        violations = stylecheck.check_entries(entries)
        assert len(violations) == 1
        assert "banned word 'robust'" in violations[0][2]

    def test_entry_without_what_field_is_skipped(self):
        entries = [(_FakePath("org.yaml"), {"name": "Org"})]
        assert stylecheck.check_entries(entries) == []

    def test_legitimate_em_dash_in_name_does_not_leak_into_what_check(self):
        # The `what` field itself has no em dash; check_entries only looks
        # at `what`, so a name with a real em dash never enters this check.
        entries = [
            (_FakePath("org.yaml"), {"name": "NZ On Air — Fund", "what": "Funds journalism."}),
        ]
        assert stylecheck.check_entries(entries) == []


class _FakePath:
    """Minimal stand-in for a pathlib.Path, exposing just .name."""

    def __init__(self, name):
        self.name = name


class TestLoadEntries:
    def test_skips_invalid_yaml(self, tmp_path, monkeypatch):
        (tmp_path / "broken.yaml").write_text("name: [unterminated\n", encoding="utf-8")
        monkeypatch.setattr(stylecheck, "ENTRIES_DIR", tmp_path)
        assert stylecheck.load_entries() == []

    def test_skips_valid_yaml_that_is_not_a_mapping(self, tmp_path, monkeypatch):
        (tmp_path / "scalar.yaml").write_text("just a string\n", encoding="utf-8")
        monkeypatch.setattr(stylecheck, "ENTRIES_DIR", tmp_path)
        assert stylecheck.load_entries() == []

    def test_loads_valid_entries(self, tmp_path, monkeypatch):
        (tmp_path / "org-a.yaml").write_text("name: Org A\n", encoding="utf-8")
        monkeypatch.setattr(stylecheck, "ENTRIES_DIR", tmp_path)
        entries = stylecheck.load_entries()
        assert len(entries) == 1
        assert entries[0][1]["name"] == "Org A"


class TestCheckProseFiles:
    def test_missing_prose_file_is_skipped(self, tmp_path, monkeypatch):
        missing = tmp_path / "does-not-exist.md"
        monkeypatch.setattr(stylecheck, "PROSE_FILES", [missing])
        monkeypatch.setattr(stylecheck, "ROOT", tmp_path)
        assert stylecheck.check_prose_files([]) == []
