Feature: Ecosystem diagram
  As a visitor
  I want to see how domains connect to each other
  So that I can understand the shape of the ecosystem

  @smoke
  Scenario: The ecosystem page renders its relationship diagram without errors
    Given I am on the ecosystem page
    Then there are no JavaScript console errors
    And I see the relationship diagram
