Feature: Directory page
  As a visitor
  I want to browse and filter the full list of organisations
  So that I can find the ones relevant to me

  @smoke
  Scenario: Directory page lists every organisation
    Given I am on the directory page
    Then the number of organisation cards shown matches the page's stated total

  Scenario: Searching narrows the list to matching organisations
    Given I am on the directory page
    When I search for the name of the first organisation shown
    Then only organisation cards matching that search remain visible

  Scenario: Filtering by domain narrows the list to that domain only
    Given I am on the directory page
    When I filter the directory by the first domain in the domain dropdown
    Then every visible organisation card belongs to that domain

  Scenario: Filtering by region narrows the list to that region only
    Given I am on the directory page
    When I filter the directory by the first region in the region dropdown
    Then every visible organisation card belongs to that region

  Scenario: Clearing filters restores the full list
    Given I am on the directory page
    And I filter the directory by the first domain in the domain dropdown
    When I clear the directory filters
    Then the number of organisation cards shown matches the page's stated total
