Feature: Accessibility
  As a visitor who uses assistive technology
  I want every page to be free of serious accessibility barriers
  So that I can use the directory regardless of how I browse

  @a11y
  Scenario: Homepage has no critical or serious accessibility violations
    Given I am on the homepage
    Then there are no critical or serious accessibility violations

  @a11y
  Scenario: Directory page has no critical or serious accessibility violations
    Given I am on the directory page
    Then there are no critical or serious accessibility violations

  @a11y
  Scenario: A domain page has no critical or serious accessibility violations
    Given I am on the domains index page
    When I open the first domain tile
    Then there are no critical or serious accessibility violations

  @a11y
  Scenario: A region page has no critical or serious accessibility violations
    Given I am on the regions index page
    When I open the first region tile
    Then there are no critical or serious accessibility violations

  @a11y
  Scenario: An entry page has no critical or serious accessibility violations
    Given I am on the directory page
    When I open the first organisation's detail page
    Then there are no critical or serious accessibility violations

  @a11y
  Scenario: Ecosystem page has no critical or serious accessibility violations
    Given I am on the ecosystem page
    Then there are no critical or serious accessibility violations

  @a11y
  Scenario: 404 page has no critical or serious accessibility violations
    When I visit an unknown page
    Then there are no critical or serious accessibility violations
