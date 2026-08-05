Feature: Export entries as JSON and CSV
  scripts/export.py writes data/exports/entries.json and entries.csv from
  every entry, with a fixed field order and list fields flattened for CSV.

  @integration
  Scenario: The JSON export includes every entry
    Given a fixture entries directory
    And a valid entry file "org-a.yaml" named "Alpha Org"
    And a valid entry file "org-b.yaml" named "Beta Org"
    When I load and export entries from the fixture directory
    Then the exported entries include "Alpha Org"
    And the exported entries include "Beta Org"

  @integration
  Scenario: Every field is mapped in the fixed field order
    Given a fixture entries directory
    And a valid entry file "org-a.yaml" named "Alpha Org"
    When I load and export entries from the fixture directory
    Then the first exported entry has fields in the fixed field order

  @integration
  Scenario: The CSV export flattens list fields into a single cell
    Given a fixture entries directory
    And a valid entry file "org-a.yaml" named "Alpha Org" with tags "civic tech, open data"
    When I load and export entries from the fixture directory
    And I write the CSV export
    Then the CSV row for "Alpha Org" has tags "civic tech; open data"

  @integration
  Scenario: An invalid entry is skipped and counted
    Given a fixture entries directory
    And a valid entry file "org-a.yaml" named "Alpha Org"
    And an entry file "org-b.yaml" missing the "name" field
    When I load and export entries from the fixture directory
    Then 1 entry was skipped
    And the exported entries include "Alpha Org"

  @smoke
  Scenario: The CLI writes JSON and CSV and exits 0
    Given a fixture repo with one valid entry "org-a.yaml"
    When I run "scripts/export.py" in the fixture repo
    Then the process exit code is 0
    And stdout contains "total entries 1"
    And the fixture repo's exports/entries.json contains "Org A"
