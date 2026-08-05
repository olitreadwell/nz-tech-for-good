Feature: Build GUIDE.md from entries
  scripts/build_guide.py reads every entry and writes GUIDE.md: grouped by
  domain, with related_to references resolved into diagram edges where
  possible, and unresolved references reported (not guessed at).

  @integration
  Scenario: GUIDE.md includes every entry by name
    Given a fixture entries directory
    And a valid entry file "org-a.yaml" named "Alpha Org"
    And a valid entry file "org-b.yaml" named "Beta Org"
    When I build the guide from the fixture directory
    Then the guide text contains "Alpha Org"
    And the guide text contains "Beta Org"
    And the guide stats total is 2

  @integration
  Scenario: Entries are grouped under their domain heading
    Given a fixture entries directory
    And a valid entry file "org-a.yaml" named "Alpha Org" in domain "civic-tech"
    When I build the guide from the fixture directory
    Then the guide text contains "## Civic Tech"

  @integration
  Scenario: A resolved related_to reference becomes a diagram edge
    Given a fixture entries directory
    And a valid entry file "org-a.yaml" named "Alpha Org" related to "Beta Org"
    And a valid entry file "org-b.yaml" named "Beta Org"
    When I build the guide from the fixture directory
    Then the guide stats unresolved refs is empty

  @integration
  Scenario: An unresolved related_to reference is reported, not guessed at
    Given a fixture entries directory
    And a valid entry file "org-a.yaml" named "Alpha Org" related to "Nonexistent Org"
    When I build the guide from the fixture directory
    Then the guide stats unresolved refs contains "Nonexistent Org"
    And the guide text does not contain "n_NonexistentOrg"

  @integration
  Scenario: A cross-domain relation is drawn as a link in the ecosystem overview
    Given a fixture entries directory
    And a valid entry file "org-a.yaml" named "Alpha Org" in domain "civic-tech" related to "Beta Org"
    And a valid entry file "org-b.yaml" named "Beta Org" in domain "open-data"
    When I build the guide from the fixture directory
    Then the guide text contains "1 link"

  @integration
  Scenario: An entry's website, GitHub, LinkedIn links and tags are all rendered
    Given a fixture entries directory
    And a fully linked entry file "org-a.yaml" named "Alpha Org"
    When I build the guide from the fixture directory
    Then the guide text contains "[Website]"
    And the guide text contains "[GitHub]"
    And the guide text contains "[LinkedIn]"
    And the guide text contains "Tags: civic tech, open data"

  @integration
  Scenario: main() writes GUIDE.md to disk
    Given a fixture entries directory
    And a valid entry file "org-a.yaml" named "Alpha Org"
    When I run build_guide.main() against the fixture directory
    Then the written guide file contains "Alpha Org"

  @smoke
  Scenario: The CLI writes GUIDE.md and exits 0
    Given a fixture repo with one valid entry "org-a.yaml"
    When I run "scripts/build_guide.py" in the fixture repo
    Then the process exit code is 0
    And stdout contains "wrote"
    And the fixture repo's GUIDE.md contains "Org A"
