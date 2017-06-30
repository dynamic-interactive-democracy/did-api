Feature: Create user
  As an external brand user
  I want to be able to retrieve a token for a user
  So that the user will be able to use the API

  Scenario: Creating user
    Given I have a users name
        And I have a users id
    When I create a user
    Then I receive a user object
