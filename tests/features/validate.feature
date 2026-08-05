Feature: Validate entries against the schema
  scripts/validate.py checks every entry in data/entries/*.yaml against
  schema/entry.schema.json, and flags duplicate names, slugs, and website
  URLs. It exits non-zero if any entry fails validation or a duplicate is
  found.

  @integration
  Scenario: A valid entry passes validation
    Given a fixture entries directory
    And a valid entry file "org-a.yaml"
    When I run validate.main() against the fixture directory
    Then the exit code is 0
    And the output contains "pass  org-a.yaml"

  @integration
  Scenario: An entry missing a required field fails validation
    Given a fixture entries directory
    And an entry file "org-a.yaml" missing the "region" field
    When I run validate.main() against the fixture directory
    Then the exit code is 1
    And the output contains "FAIL  org-a.yaml"

  @integration
  Scenario: An entry with an invalid domain enum value fails validation
    Given a fixture entries directory
    And an entry file "org-a.yaml" with domain "not-a-real-domain"
    When I run validate.main() against the fixture directory
    Then the exit code is 1
    And the output contains "FAIL  org-a.yaml"
    And the output contains "domain"

  @integration
  Scenario: Duplicate entry names are flagged as fatal
    Given a fixture entries directory
    And a valid entry file "org-a.yaml" named "Same Org"
    And a valid entry file "org-b.yaml" named "Same Org"
    When I run validate.main() against the fixture directory
    Then the exit code is 1
    And the output contains "duplicate name"

  @integration
  Scenario: Duplicate website URLs are flagged as fatal
    Given a fixture entries directory
    And a valid entry file "org-a.yaml" with website "https://example.org"
    And a valid entry file "org-b.yaml" with website "https://example.org/"
    When I run validate.main() against the fixture directory
    Then the exit code is 1
    And the output contains "duplicate website URL"

  @integration
  Scenario: An empty entries directory is an error
    Given a fixture entries directory
    When I run validate.main() against the fixture directory
    Then the exit code is 1
    And the output contains "no .yaml files found"

  @integration
  Scenario: A non-existent entries directory is an error
    Given a non-existent fixture entries directory
    When I run validate.main() against the fixture directory
    Then the exit code is 1
    And the output contains "does not exist"

  @integration
  Scenario: An entry file with invalid YAML fails validation
    Given a fixture entries directory
    And an entry file "org-a.yaml" containing invalid YAML
    When I run validate.main() against the fixture directory
    Then the exit code is 1
    And the output contains "invalid YAML"

  @integration
  Scenario: An entry file that isn't a YAML mapping fails validation
    Given a fixture entries directory
    And an entry file "org-a.yaml" containing a YAML list, not a mapping
    When I run validate.main() against the fixture directory
    Then the exit code is 1
    And the output contains "does not contain a YAML mapping"

  @integration
  Scenario: An entry missing its name is still checked without being tracked for duplicates
    Given a fixture entries directory
    And an entry file "org-a.yaml" missing the "name" field
    When I run validate.main() against the fixture directory
    Then the exit code is 1
    And the output contains "FAIL  org-a.yaml"

  @integration
  Scenario: Falls back to the basic required-fields check when jsonschema is unavailable
    Given a fixture entries directory
    And an entry file "org-a.yaml" missing the "region" field
    And jsonschema is unavailable
    When I run validate.main() against the fixture directory
    Then the exit code is 1
    And the output contains "missing required field 'region'"

  @smoke
  Scenario: The CLI exits 0 for a clean fixture repo
    Given a fixture repo with one valid entry "org-a.yaml"
    When I run "scripts/validate.py" in the fixture repo
    Then the process exit code is 0
    And stdout contains "1 passed, 0 failed"

  @smoke
  Scenario: The CLI exits 1 and reports a failure for an invalid entry
    Given a fixture repo with an entry "org-a.yaml" missing the "name" field
    When I run "scripts/validate.py" in the fixture repo
    Then the process exit code is 1
    And stdout contains "FAIL  org-a.yaml"
