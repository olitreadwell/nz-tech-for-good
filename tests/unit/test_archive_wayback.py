"""Unit tests for scripts/archive_wayback.py.

Every test mocks urllib.request.urlopen so the suite never touches the
real Wayback Machine. The script's module-level paths (ENTRIES_DIR,
ARCHIVES_PATH) are pointed at a tmp_path fixture, matching how the other
script tests work.
"""

import io
import json
import urllib.error
from datetime import datetime, timedelta, timezone

import pytest

import archive_wayback as awb

FIXED_NOW = datetime(2026, 8, 25, 6, 0, 0, tzinfo=timezone.utc)


class FakeResponse:
    """Minimal urllib response: a context manager exposing geturl()."""

    def __init__(self, final_url):
        self._final_url = final_url

    def geturl(self):
        return self._final_url

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False


def write_entry(entries_dir, filename, website):
    content = f"name: Test Org\nwebsite: {website}\n" if website else "name: Test Org\n"
    (entries_dir / filename).write_text(content, encoding="utf-8")


@pytest.fixture
def isolated_paths(tmp_path, monkeypatch):
    entries_dir = tmp_path / "entries"
    entries_dir.mkdir()
    archives_path = tmp_path / "archives.json"
    monkeypatch.setattr(awb, "ENTRIES_DIR", entries_dir)
    monkeypatch.setattr(awb, "ARCHIVES_PATH", archives_path)
    monkeypatch.setattr(awb, "REQUEST_DELAY_SECONDS", 0)
    return entries_dir, archives_path


def make_archived_record(url, archived_at, archive_url="https://web.archive.org/web/1/https://example.org/"):
    return {
        "url": url,
        "archive_url": archive_url,
        "archived_at": archived_at,
        "status": "archived",
    }


class TestDryRun:
    def test_dry_run_makes_no_network_calls_and_writes_nothing(self, isolated_paths, monkeypatch, capsys):
        entries_dir, archives_path = isolated_paths
        write_entry(entries_dir, "org-a.yaml", "https://example.org")

        def fail_urlopen(*args, **kwargs):
            raise AssertionError("dry run must not open the network")

        monkeypatch.setattr(awb.urllib.request, "urlopen", fail_urlopen)

        assert awb.main(["--dry-run"]) == 0
        out = capsys.readouterr().out
        assert "would archive org-a: https://example.org" in out
        assert not archives_path.exists()


class TestArchiving:
    def test_archiving_writes_correct_json(self, isolated_paths, monkeypatch):
        entries_dir, archives_path = isolated_paths
        write_entry(entries_dir, "org-a.yaml", "https://example.org")

        def fake_urlopen(request, timeout=30):
            return FakeResponse("https://web.archive.org/web/20260825060000/https://example.org/")

        monkeypatch.setattr(awb.urllib.request, "urlopen", fake_urlopen)
        monkeypatch.setattr(awb, "now_utc", lambda: FIXED_NOW)

        assert awb.main([]) == 0
        data = json.loads(archives_path.read_text(encoding="utf-8"))
        assert data == {
            "org-a": {
                "url": "https://example.org",
                "archive_url": "https://web.archive.org/web/20260825060000/https://example.org/",
                "archived_at": "2026-08-25T06:00:00+00:00",
                "status": "archived",
            }
        }

    def test_http_error_is_recorded_with_note(self, isolated_paths, monkeypatch, capsys):
        entries_dir, archives_path = isolated_paths
        write_entry(entries_dir, "org-a.yaml", "https://example.org")

        def raise_http_error(request, timeout=30):
            raise urllib.error.HTTPError(request.full_url, 403, "Forbidden", {}, io.BytesIO(b""))

        monkeypatch.setattr(awb.urllib.request, "urlopen", raise_http_error)
        monkeypatch.setattr(awb, "now_utc", lambda: FIXED_NOW)

        assert awb.main([]) == 0
        data = json.loads(archives_path.read_text(encoding="utf-8"))
        assert data["org-a"]["status"] == "error"
        assert "HTTP 403 Forbidden" in data["org-a"]["note"]
        assert "archive_url" not in data["org-a"]
        assert "error org-a" in capsys.readouterr().out


class TestMerge:
    def test_merge_preserves_existing_records(self, isolated_paths, monkeypatch):
        entries_dir, archives_path = isolated_paths
        write_entry(entries_dir, "org-b.yaml", "https://b.example.org")
        existing = {"org-a": make_archived_record("https://a.example.org", "2026-01-01T00:00:00+00:00")}
        archives_path.write_text(json.dumps(existing), encoding="utf-8")

        def fake_urlopen(request, timeout=30):
            return FakeResponse("https://web.archive.org/web/20260825060000/https://b.example.org/")

        monkeypatch.setattr(awb.urllib.request, "urlopen", fake_urlopen)
        monkeypatch.setattr(awb, "now_utc", lambda: FIXED_NOW)

        assert awb.main([]) == 0
        data = json.loads(archives_path.read_text(encoding="utf-8"))
        assert data["org-a"] == existing["org-a"]
        assert data["org-b"]["status"] == "archived"


class TestSkipLogic:
    def test_skip_recently_archived_entries(self, isolated_paths, monkeypatch, capsys):
        entries_dir, archives_path = isolated_paths
        write_entry(entries_dir, "org-a.yaml", "https://example.org")
        recent = (FIXED_NOW - timedelta(days=1)).isoformat()
        archives_path.write_text(
            json.dumps({"org-a": make_archived_record("https://example.org", recent)}),
            encoding="utf-8",
        )

        def fail_urlopen(*args, **kwargs):
            raise AssertionError("recently archived entry must not be re-fetched")

        monkeypatch.setattr(awb.urllib.request, "urlopen", fail_urlopen)
        monkeypatch.setattr(awb, "now_utc", lambda: FIXED_NOW)

        assert awb.main([]) == 0
        assert "skip org-a" in capsys.readouterr().out

    def test_error_records_are_retried_even_when_recent(self, isolated_paths, monkeypatch):
        entries_dir, archives_path = isolated_paths
        write_entry(entries_dir, "org-a.yaml", "https://example.org")
        recent = (FIXED_NOW - timedelta(days=1)).isoformat()
        archives_path.write_text(
            json.dumps({"org-a": {"url": "https://example.org", "archived_at": recent, "status": "error", "note": "HTTP 500"}}),
            encoding="utf-8",
        )

        def fake_urlopen(request, timeout=30):
            return FakeResponse("https://web.archive.org/web/20260825060000/https://example.org/")

        monkeypatch.setattr(awb.urllib.request, "urlopen", fake_urlopen)
        monkeypatch.setattr(awb, "now_utc", lambda: FIXED_NOW)

        assert awb.main([]) == 0
        data = json.loads(archives_path.read_text(encoding="utf-8"))
        assert data["org-a"]["status"] == "archived"
        assert data["org-a"]["archived_at"] == FIXED_NOW.isoformat()

    def test_force_rearchives_recently_archived_entry(self, isolated_paths, monkeypatch):
        entries_dir, archives_path = isolated_paths
        write_entry(entries_dir, "org-a.yaml", "https://example.org")
        recent = (FIXED_NOW - timedelta(days=1)).isoformat()
        archives_path.write_text(
            json.dumps({"org-a": make_archived_record("https://example.org", recent)}),
            encoding="utf-8",
        )

        def fake_urlopen(request, timeout=30):
            return FakeResponse("https://web.archive.org/web/20260825060000/https://example.org/")

        monkeypatch.setattr(awb.urllib.request, "urlopen", fake_urlopen)
        monkeypatch.setattr(awb, "now_utc", lambda: FIXED_NOW)

        assert awb.main(["--force"]) == 0
        data = json.loads(archives_path.read_text(encoding="utf-8"))
        assert data["org-a"]["archived_at"] == FIXED_NOW.isoformat()

    def test_entry_without_website_is_skipped_without_network(self, isolated_paths, monkeypatch, capsys):
        entries_dir, archives_path = isolated_paths
        write_entry(entries_dir, "org-a.yaml", "")

        def fail_urlopen(*args, **kwargs):
            raise AssertionError("entry without a website must not be fetched")

        monkeypatch.setattr(awb.urllib.request, "urlopen", fail_urlopen)

        assert awb.main([]) == 0
        assert "skip org-a: entry has no website URL" in capsys.readouterr().out
        assert json.loads(archives_path.read_text(encoding="utf-8")) == {}


class TestSlugFilter:
    def test_unknown_slug_is_an_error(self, isolated_paths, monkeypatch, capsys):
        entries_dir, _archives_path = isolated_paths
        write_entry(entries_dir, "org-a.yaml", "https://example.org")

        assert awb.main(["--slug", "does-not-exist"]) == 1
        assert "no entry file" in capsys.readouterr().out
