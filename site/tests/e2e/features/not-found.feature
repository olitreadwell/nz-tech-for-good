Feature: 404 page
  As a visitor
  I want a clear page when I follow a broken or outdated link
  So that I can find my way back into the site

  @smoke
  Scenario: An unknown route shows the not-found page
    When I visit an unknown page
    Then I see a heading "Page not found"
    And I see a link back to the homepage
