"""Unit tests for the non-network parts of scripts/linkcheck.py: URL
collection and result formatting. run_lychee() and fallback_check() do
real subprocess/network calls, so the bulk of their branches are covered
in tests/features/linkcheck.feature with mocked collaborators; a couple
of fallback_check()'s less common branches and all of main()'s branches
are covered here with urlopen/collect_urls/etc monkeypatched directly.
"""

import urllib.error

import linkcheck


class TestFindRefs:
    def test_exact_match(self):
        urls = {"https://example.org": [("Org A", "website")]}
        assert linkcheck.find_refs("https://example.org", urls) == [("Org A", "website")]

    def test_trailing_slash_insensitive_match(self):
        urls = {"https://example.org": [("Org A", "website")]}
        assert linkcheck.find_refs("https://example.org/", urls) == [("Org A", "website")]

    def test_no_match_returns_empty_list(self):
        urls = {"https://example.org": [("Org A", "website")]}
        assert linkcheck.find_refs("https://other.org", urls) == []

    def test_stored_url_with_trailing_slash_matches_bare_lookup(self):
        urls = {"https://example.org/": [("Org A", "website")]}
        assert linkcheck.find_refs("https://example.org", urls) == [("Org A", "website")]


class TestCollectUrls:
    def test_collects_urls_from_url_fields(self, tmp_path, monkeypatch):
        (tmp_path / "org-a.yaml").write_text(
            "name: Org A\nwebsite: https://a.example.org\ngithub: ''\nlinkedin_org: ''\n",
            encoding="utf-8",
        )
        monkeypatch.setattr(linkcheck, "ENTRIES_DIR", tmp_path)
        urls = linkcheck.collect_urls()
        assert urls == {"https://a.example.org": [("Org A", "website")]}

    def test_same_url_across_entries_and_fields_accumulates_refs(self, tmp_path, monkeypatch):
        (tmp_path / "org-a.yaml").write_text(
            "name: Org A\nwebsite: https://shared.example.org\n", encoding="utf-8"
        )
        (tmp_path / "org-b.yaml").write_text(
            "name: Org B\ngithub: https://shared.example.org\n", encoding="utf-8"
        )
        monkeypatch.setattr(linkcheck, "ENTRIES_DIR", tmp_path)
        urls = linkcheck.collect_urls()
        assert urls["https://shared.example.org"] == [("Org A", "website"), ("Org B", "github")]

    def test_blank_url_fields_are_skipped(self, tmp_path, monkeypatch):
        (tmp_path / "org-a.yaml").write_text(
            "name: Org A\nwebsite: ''\ngithub: ''\nlinkedin_org: ''\n", encoding="utf-8"
        )
        monkeypatch.setattr(linkcheck, "ENTRIES_DIR", tmp_path)
        assert linkcheck.collect_urls() == {}

    def test_non_mapping_yaml_is_skipped(self, tmp_path, monkeypatch):
        (tmp_path / "list.yaml").write_text("- one\n- two\n", encoding="utf-8")
        monkeypatch.setattr(linkcheck, "ENTRIES_DIR", tmp_path)
        assert linkcheck.collect_urls() == {}


class TestBotBlockCodes:
    def test_403_is_a_bot_block_code(self):
        assert 403 in linkcheck.BOT_BLOCK_CODES

    def test_999_is_a_bot_block_code(self):
        assert 999 in linkcheck.BOT_BLOCK_CODES

    def test_404_is_not_a_bot_block_code(self):
        assert 404 not in linkcheck.BOT_BLOCK_CODES


class TestFallbackCheckExtraBranches:
    def test_non_404_non_bot_block_http_error_is_treated_as_bot_blocked(self, monkeypatch):
        def fake_urlopen(req, timeout=10):
            raise urllib.error.HTTPError(req.full_url, 500, "Server Error", {}, None)

        monkeypatch.setattr(linkcheck.urllib.request, "urlopen", fake_urlopen)
        dead, bot_blocked = linkcheck.fallback_check(["https://example.org/error"])
        assert dead == []
        assert bot_blocked == [("https://example.org/error", 500)]

    def test_unexpected_exception_is_treated_as_dead(self, monkeypatch):
        def fake_urlopen(req, timeout=10):
            raise ValueError("boom")

        monkeypatch.setattr(linkcheck.urllib.request, "urlopen", fake_urlopen)
        dead, bot_blocked = linkcheck.fallback_check(["https://example.org/broken"])
        assert bot_blocked == []
        assert dead == [("https://example.org/broken", "error: boom")]


class TestMain:
    def test_no_urls_and_no_lychee_exits_0(self, monkeypatch, capsys):
        monkeypatch.setattr(linkcheck, "collect_urls", lambda: {})
        monkeypatch.setattr(linkcheck.shutil, "which", lambda name: None)
        exit_code = linkcheck.main()
        out = capsys.readouterr().out
        assert exit_code == 0
        assert "Checking 0 unique URLs" in out
        assert "lychee not found on PATH" in out
        assert "No genuinely dead links found." in out

    def test_dead_links_found_exits_1(self, monkeypatch, capsys):
        urls = {"https://example.org/gone": [("Org A", "website")]}
        monkeypatch.setattr(linkcheck, "collect_urls", lambda: urls)
        monkeypatch.setattr(linkcheck.shutil, "which", lambda name: None)
        monkeypatch.setattr(linkcheck, "fallback_check", lambda urls: ([("https://example.org/gone", 404)], []))
        exit_code = linkcheck.main()
        out = capsys.readouterr().out
        assert exit_code == 1
        assert "DEAD LINKS (1)" in out
        assert "Org A (website)" in out
        assert "FAIL: 1 dead link(s) found." in out

    def test_bot_blocked_links_are_reported_but_not_fatal(self, monkeypatch, capsys):
        urls = {"https://linkedin.com/company/example": [("Org A", "linkedin_org")]}
        monkeypatch.setattr(linkcheck, "collect_urls", lambda: urls)
        monkeypatch.setattr(linkcheck.shutil, "which", lambda name: None)
        monkeypatch.setattr(
            linkcheck, "fallback_check", lambda urls: ([], [("https://linkedin.com/company/example", 403)])
        )
        exit_code = linkcheck.main()
        out = capsys.readouterr().out
        assert exit_code == 0
        assert "Bot-blocked or non-404 responses (1)" in out
        assert "No genuinely dead links found." in out

    def test_uses_lychee_when_on_path(self, monkeypatch, capsys):
        urls = {"https://example.org": [("Org A", "website")]}
        monkeypatch.setattr(linkcheck, "collect_urls", lambda: urls)
        monkeypatch.setattr(linkcheck.shutil, "which", lambda name: "/usr/bin/lychee")
        monkeypatch.setattr(linkcheck, "run_lychee", lambda urls: ([], []))
        exit_code = linkcheck.main()
        out = capsys.readouterr().out
        assert exit_code == 0
        assert "Using lychee for link checking." in out

    def test_falls_back_when_lychee_output_unparseable(self, monkeypatch, capsys):
        urls = {"https://example.org": [("Org A", "website")]}
        monkeypatch.setattr(linkcheck, "collect_urls", lambda: urls)
        monkeypatch.setattr(linkcheck.shutil, "which", lambda name: "/usr/bin/lychee")
        monkeypatch.setattr(linkcheck, "run_lychee", lambda urls: (None, None))
        monkeypatch.setattr(linkcheck, "fallback_check", lambda urls: ([], []))
        exit_code = linkcheck.main()
        out = capsys.readouterr().out
        assert exit_code == 0
        assert "lychee run failed to produce parseable output; falling back to urllib." in out
