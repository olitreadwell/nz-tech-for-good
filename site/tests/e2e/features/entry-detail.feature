Feature: Organisation detail page
  As a visitor
  I want to see the full detail for one organisation
  So that I can decide whether to visit, contact, or work with it

  @smoke
  Scenario: An entry page shows the organisation's name, domain, and description
    Given I am on the directory page
    When I open the first organisation's detail page
    Then I see its name as the page heading
    And I see its domain
    And I see its description
    And I see a link back to the directory
