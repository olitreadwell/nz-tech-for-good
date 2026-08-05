"""Step definitions for tests/features/linkcheck.feature.

run_lychee() and fallback_check() are exercised with subprocess.run and
urllib.request.urlopen monkeypatched to canned responses, so no real
subprocess or network call happens. Uses anchored regex step patterns
(see test_validate_steps.py's module docstring for why parsers.parse's
greedy default field is unsafe here).
"""

import json
import urllib.error

from pytest_bdd import given, parsers, scenarios, then, when

import linkcheck
from conftest import make_entry, write_entry

scenarios("linkcheck.feature")


class _FakeCompletedProcess:
    def __init__(self, stdout):
        self.stdout = stdout
        self.stderr = ""


@given(parsers.re(r'^a mocked lychee subprocess reporting url "(?P<url>[^"]+)" with status code (?P<code>\d+)$'))
def _mocked_lychee_subprocess(bdd_context, monkeypatch, url, code):
    payload = {"error_map": {"tmpfile": [{"url": url, "status": {"code": int(code)}}]}}

    def fake_run(*args, **kwargs):
        return _FakeCompletedProcess(json.dumps(payload))

    monkeypatch.setattr(linkcheck.subprocess, "run", fake_run)


@given("a mocked lychee subprocess producing unparseable output")
def _mocked_lychee_subprocess_bad_output(bdd_context, monkeypatch):
    def fake_run(*args, **kwargs):
        return _FakeCompletedProcess("this is not json")

    monkeypatch.setattr(linkcheck.subprocess, "run", fake_run)


@when(parsers.re(r'^I run run_lychee with one url "(?P<url>[^"]+)"$'))
def _run_run_lychee(bdd_context, url):
    urls = {url: [("Test Org", "website")]}
    dead, bot_blocked = linkcheck.run_lychee(urls)
    bdd_context["dead"] = dead
    bdd_context["bot_blocked"] = bot_blocked


@then("run_lychee's dead result is None")
def _dead_result_is_none(bdd_context):
    assert bdd_context["dead"] is None


@given("a mocked urlopen that raises a 404 HTTPError")
def _mocked_urlopen_404(bdd_context, monkeypatch):
    def fake_urlopen(req, timeout=10):
        raise urllib.error.HTTPError(req.full_url, 404, "Not Found", {}, None)

    monkeypatch.setattr(linkcheck.urllib.request, "urlopen", fake_urlopen)


@given("a mocked urlopen that raises a 403 HTTPError")
def _mocked_urlopen_403(bdd_context, monkeypatch):
    def fake_urlopen(req, timeout=10):
        raise urllib.error.HTTPError(req.full_url, 403, "Forbidden", {}, None)

    monkeypatch.setattr(linkcheck.urllib.request, "urlopen", fake_urlopen)


@given("a mocked urlopen that raises a DNS URLError")
def _mocked_urlopen_dns_error(bdd_context, monkeypatch):
    def fake_urlopen(req, timeout=10):
        raise urllib.error.URLError("Name or service not known")

    monkeypatch.setattr(linkcheck.urllib.request, "urlopen", fake_urlopen)


@given("a mocked urlopen that succeeds")
def _mocked_urlopen_success(bdd_context, monkeypatch):
    def fake_urlopen(req, timeout=10):
        return None

    monkeypatch.setattr(linkcheck.urllib.request, "urlopen", fake_urlopen)


@when(parsers.re(r'^I run fallback_check with one url "(?P<url>[^"]+)"$'))
def _run_fallback_check(bdd_context, url):
    dead, bot_blocked = linkcheck.fallback_check([url])
    bdd_context["dead"] = dead
    bdd_context["bot_blocked"] = bot_blocked


@then(parsers.re(r'^the dead links include "(?P<url>[^"]+)"$'))
def _dead_links_include(bdd_context, url):
    assert any(u == url for u, _code in bdd_context["dead"])


@then(parsers.re(r'^the bot-blocked links include "(?P<url>[^"]+)"$'))
def _bot_blocked_links_include(bdd_context, url):
    assert any(u == url for u, _code in bdd_context["bot_blocked"])


@then("the dead links is empty")
def _dead_links_empty(bdd_context):
    assert bdd_context["dead"] == []


@then("the bot-blocked links is empty")
def _bot_blocked_links_empty(bdd_context):
    assert bdd_context["bot_blocked"] == []


@given(parsers.re(r'^a fixture repo with an entry "(?P<filename>[^"]+)" with no links$'))
def _fixture_repo_entry_no_links(bdd_context, fixture_repo, filename):
    write_entry(
        fixture_repo / "data" / "entries",
        filename,
        make_entry(name="No Links Org", website="", github="", linkedin_org=""),
    )
    bdd_context["repo"] = fixture_repo
