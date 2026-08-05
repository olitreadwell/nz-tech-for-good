Feature: Regions
  As a visitor
  I want to browse organisations grouped by region
  So that I can find groups near me or working nationally

  @smoke
  Scenario: Region index lists every region
    Given I am on the regions index page
    Then I see at least one region tile

  Scenario: A region page shows only organisations in that region
    Given I am on the regions index page
    When I open the first region tile
    Then every organisation card on the page belongs to that region
