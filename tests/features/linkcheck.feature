Feature: Check entry links for dead links
  scripts/linkcheck.py checks website/github/linkedin_org URLs across all
  entries. It prefers lychee if installed, falling back to a plain urllib
  check otherwise. Genuinely dead links (404, DNS failure, refused
  connection) fail the build; bot-blocked responses (403, 999) are
  reported but not fatal. These scenarios mock the network/subprocess
  boundary so no real requests are made.

  @integration
  Scenario: run_lychee classifies a 404 from lychee's JSON report as dead
    Given a mocked lychee subprocess reporting url "https://example.org/gone" with status code 404
    When I run run_lychee with one url "https://example.org/gone"
    Then the dead links include "https://example.org/gone"

  @integration
  Scenario: run_lychee classifies a 403 from lychee's JSON report as bot-blocked
    Given a mocked lychee subprocess reporting url "https://linkedin.com/company/example" with status code 403
    When I run run_lychee with one url "https://linkedin.com/company/example"
    Then the bot-blocked links include "https://linkedin.com/company/example"

  @integration
  Scenario: run_lychee returns None when its JSON output can't be parsed
    Given a mocked lychee subprocess producing unparseable output
    When I run run_lychee with one url "https://example.org"
    Then run_lychee's dead result is None

  @integration
  Scenario: fallback_check classifies a 404 response as dead
    Given a mocked urlopen that raises a 404 HTTPError
    When I run fallback_check with one url "https://example.org/gone"
    Then the dead links include "https://example.org/gone"

  @integration
  Scenario: fallback_check classifies a 403 response as bot-blocked
    Given a mocked urlopen that raises a 403 HTTPError
    When I run fallback_check with one url "https://linkedin.com/company/example"
    Then the bot-blocked links include "https://linkedin.com/company/example"

  @integration
  Scenario: fallback_check classifies a DNS failure as dead
    Given a mocked urlopen that raises a DNS URLError
    When I run fallback_check with one url "https://nonexistent.example"
    Then the dead links include "https://nonexistent.example"

  @integration
  Scenario: fallback_check treats a successful response as neither dead nor bot-blocked
    Given a mocked urlopen that succeeds
    When I run fallback_check with one url "https://example.org"
    Then the dead links is empty
    And the bot-blocked links is empty

  @smoke
  Scenario: The CLI exits 0 without hitting the network when there are no URLs
    Given a fixture repo with an entry "org-a.yaml" with no links
    When I run "scripts/linkcheck.py" in the fixture repo
    Then the process exit code is 0
    And stdout contains "Checking 0 unique URLs"
    And stdout contains "No genuinely dead links found"
