Feature: Data-quality checks for entries
  scripts/dataquality.py flags duplicate names and websites (fatal), and
  warns (non-fatal) about stale last_verified dates and filename/slug
  mismatches.

  @integration
  Scenario: Duplicate names are detected case-insensitively
    Given a fixture entries directory
    And a valid entry file "org-a.yaml" named "Community Org"
    And a valid entry file "org-b.yaml" named "COMMUNITY ORG"
    When I run dataquality.main() against the fixture directory
    Then the exit code is 1
    And the output contains "duplicate name (case-insensitive)"

  @integration
  Scenario: Duplicate websites are detected after normalisation
    Given a fixture entries directory
    And a valid entry file "org-a.yaml" with website "https://example.org"
    And a valid entry file "org-b.yaml" with website "https://www.example.org/"
    When I run dataquality.main() against the fixture directory
    Then the exit code is 1
    And the output contains "duplicate website (normalised)"

  @integration
  Scenario: An old last_verified date triggers a freshness warning but does not fail the build
    Given a fixture entries directory
    And a valid entry file "org-a.yaml" last verified on "2020-01-01"
    When I run dataquality.main() against the fixture directory
    Then the exit code is 0
    And the output contains "entries older than"

  @integration
  Scenario: A missing last_verified date triggers a freshness warning
    Given a fixture entries directory
    And an entry file "org-a.yaml" missing the "last_verified" field
    When I run dataquality.main() against the fixture directory
    Then the exit code is 0
    And the output contains "MISSING"

  @integration
  Scenario: A filename that doesn't match its entry's slug triggers a warning
    Given a fixture entries directory
    And a valid entry file "wrong-filename.yaml" named "Correct Org Name"
    When I run dataquality.main() against the fixture directory
    Then the exit code is 0
    And the output contains "filename/slug mismatches"

  @integration
  Scenario: Clean data with no issues passes without warnings
    Given a fixture entries directory
    And a valid entry file "correct-org-name.yaml" named "Correct Org Name" verified today
    When I run dataquality.main() against the fixture directory
    Then the exit code is 0
    And the output contains "RESULT: pass"

  @smoke
  Scenario: The CLI exits 1 when a duplicate name is present
    Given a fixture repo with two entries named "Community Org"
    When I run "scripts/dataquality.py" in the fixture repo
    Then the process exit code is 1
    And stdout contains "duplicate name"

  @smoke
  Scenario: The CLI exits 0 when there are only non-fatal warnings
    Given a fixture repo with one valid entry "org-a.yaml"
    When I run "scripts/dataquality.py" in the fixture repo
    Then the process exit code is 0
