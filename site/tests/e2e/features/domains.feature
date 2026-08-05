Feature: Domains
  As a visitor
  I want to browse organisations grouped by domain
  So that I can find groups working in a specific area of public good

  @smoke
  Scenario: Domain index lists every domain
    Given I am on the domains index page
    Then I see at least one domain tile

  Scenario: A domain page shows only organisations in that domain
    Given I am on the domains index page
    When I open the first domain tile
    Then every organisation card on the page belongs to that domain
