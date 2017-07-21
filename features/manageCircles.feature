Feature: Manage circles
  As a user
  I want to be able to perform CRUD on circles
  So that I can use the collaboration tools of circles

  Scenario: Creating a circle
    Given I have a users token
        And I want to create a circle
        And I want the name of the circle to be "Cool Circle"
    When I create the circle
    Then I receive a HTTP 201 code
        And I receive a circle object
        And the name of the circle is "Cool Circle"
