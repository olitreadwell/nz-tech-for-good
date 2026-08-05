Feature: Style checks for prose
  scripts/stylecheck.py fails on em dashes or banned words in README.md,
  CONTRIBUTING.md, docs/*.md (except docs/STYLE.md), GUIDE.md, and every
  entry's `what` field. The `source` field is not prose and is never
  checked, and a real em dash inside an entry's own name is allowed to
  pass through in prose that quotes that name.

  @integration
  Scenario: An em dash in README.md fails the check
    Given a fixture prose repo
    And "README.md" contains an em dash
    When I run stylecheck.main() against the fixture repo
    Then the exit code is 1
    And the output contains "em dash"

  @integration
  Scenario: A banned word in an entry's what field fails the check
    Given a fixture prose repo
    And an entry "org-a.yaml" whose what field contains "leverage"
    When I run stylecheck.main() against the fixture repo
    Then the exit code is 1
    And the output contains "banned word 'leverage'"

  @integration
  Scenario: A banned word in an entry's source field is not flagged
    Given a fixture prose repo
    And an entry "org-a.yaml" whose source field contains "leverage"
    When I run stylecheck.main() against the fixture repo
    Then the exit code is 0

  @integration
  Scenario: docs/STYLE.md is excluded even though it names the banned words
    Given a fixture prose repo
    And "docs/STYLE.md" contains an em dash and the word "leverage"
    When I run stylecheck.main() against the fixture repo
    Then the exit code is 0

  @integration
  Scenario: A real em dash in an entry name does not false-positive in prose that quotes it
    Given a fixture prose repo
    And an entry "org-a.yaml" named "NZ On Air — Public Interest Journalism Fund"
    And "README.md" mentions the entry name "NZ On Air — Public Interest Journalism Fund"
    When I run stylecheck.main() against the fixture repo
    Then the exit code is 0

  @smoke
  Scenario: The CLI exits 0 for a clean fixture repo
    Given a fixture repo with one valid entry "org-a.yaml"
    When I run "scripts/stylecheck.py" in the fixture repo
    Then the process exit code is 0
    And stdout contains "pass"

  @smoke
  Scenario: The CLI exits 1 for a fixture repo with a banned word in README.md
    Given a fixture repo with one valid entry "org-a.yaml"
    And "README.md" in the fixture repo contains the word "delve"
    When I run "scripts/stylecheck.py" in the fixture repo
    Then the process exit code is 1
    And stdout contains "banned word 'delve'"
