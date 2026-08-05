Feature: Coverage report for entries
  scripts/coverage.py reports per-domain and per-region counts, and flags
  domains with fewer than 3 entries (including domains with zero entries).
  It is a report, not a gate: it always exits 0.

  @integration
  Scenario: Per-domain counts are correct
    Given a fixture entries directory
    And a valid entry file "org-a.yaml" named "Alpha Org" in domain "civic-tech"
    And a valid entry file "org-b.yaml" named "Beta Org" in domain "civic-tech"
    And a valid entry file "org-c.yaml" named "Gamma Org" in domain "open-data"
    When I run coverage.main() against the fixture directory
    Then the exit code is 0
    And the output contains "civic-tech"
    And the output contains "2 entries"

  @integration
  Scenario: Per-region counts are correct
    Given a fixture entries directory
    And a valid entry file "org-a.yaml" named "Alpha Org" in region "Wellington"
    And a valid entry file "org-b.yaml" named "Beta Org" in region "Wellington"
    And a valid entry file "org-c.yaml" named "Gamma Org" in region "Auckland"
    When I run coverage.main() against the fixture directory
    Then the exit code is 0
    And the output contains "Wellington"
    And the output contains "Auckland"

  @integration
  Scenario: A domain with zero entries is flagged as thin
    Given a fixture entries directory
    And a valid entry file "org-a.yaml" named "Alpha Org" in domain "civic-tech"
    When I run coverage.main() against the fixture directory
    Then the exit code is 0
    And the output contains "govtech: 0 entries"

  @integration
  Scenario: A domain with fewer than 3 entries is flagged as thin
    Given a fixture entries directory
    And a valid entry file "org-a.yaml" named "Alpha Org" in domain "civic-tech"
    And a valid entry file "org-b.yaml" named "Beta Org" in domain "civic-tech"
    When I run coverage.main() against the fixture directory
    Then the exit code is 0
    And the output contains "civic-tech: 2 entries"

  @smoke
  Scenario: The CLI always exits 0, even for an empty fixture repo
    Given a fixture repo with one valid entry "org-a.yaml"
    When I run "scripts/coverage.py" in the fixture repo
    Then the process exit code is 0
    And stdout contains "Coverage report"
