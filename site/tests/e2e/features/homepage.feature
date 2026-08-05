Feature: Homepage
  As a visitor
  I want to understand what the directory is about as soon as I land
  So that I can decide whether to explore it further

  @smoke
  Scenario: Homepage loads with its main heading and primary navigation
    Given I am on the homepage
    Then the page title contains "NZ Tech-for-Good"
    And I see a heading "Aotearoa New Zealand tech for public good"
    And I see primary navigation links for "Directory", "Domains", "Regions", and "Ecosystem"

  Scenario: Homepage links through to the directory
    Given I am on the homepage
    When I click the "Browse the directory" link
    Then I am taken to the directory page
