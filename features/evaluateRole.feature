Feature: Evaluate role
    As a member of a circle
    I want to be able to evaluate a role
    In order to help the person with the role improve, and to help future holders of the role

    Scenario: Submit role evaluation
        Given I have a users token
        And a circle, "Cake Circle", to which I belong
        And the circle has a role "Bridge Builder"
        When I evaluate the role with ID "bridge-builder" with the following data:
        | content | Good bridges. Well done, buddy. Keep building 'em. |
        Then I should receive a HTTP 201 response with the following object as `evaluation`:
        | content | Good bridges. Well done, buddy. Keep building 'em. |
        And the date of the evaluation should be today's date

    Scenario: See previous evaluations
        Given I have a users token
        And a circle, "Cake Circle", to which I belong
        And the circle has a role "Bridge Builder"
        And an evaluation has been given to the role with ID "bridge-builder" with the following data:
        | content | Good bridges. Well done, buddy. Keep building 'em. |
        And an evaluation has been given to the role with ID "bridge-builder" with the following data:
        | content | The bridges are alright, but the attitude with which they are built could be better. |
        When I request the role with ID "bridge-builder"
        Then I should receive a HTTP 200 response with the following object as `role`:
        | title                  | Bridge Builder                                                     |
        | roleId                 | bridge-builder                                                     |
        And there should be 2 evaluations on the returned role
        And the following evaluations should exist on the returned role:
        | content                                                                              |
        | Good bridges. Well done, buddy. Keep building 'em.                                   |
        | The bridges are alright, but the attitude with which they are built could be better. |
