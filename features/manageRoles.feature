Feature: Manage roles
    As a user in a circle
    I want to be able to manage roles on my circle
    So that I can make sure we all know who has which responsibility

    Scenario: Creating a role
        Given I have a users token
        And a circle, "Cool Circle", to which I belong
        When I create a role "Poker Card Dealer" for myself with the following data:
        | areaOfResponsibility   | Deal the poker cards                                               |
        | desiredCharacteristics | A swift hand, low tendency to pack the deck to anyone's advantage. |
        Then I should receive a HTTP 201 response with the following object as `role`:
        | title                  | Poker Card Dealer                                                  |
        | roleId                 | poker-card-dealer                                                  |
        | areaOfResponsibility   | Deal the poker cards                                               |
        | desiredCharacteristics | A swift hand, low tendency to pack the deck to anyone's advantage. |
        And the term on the returned role should start today, and have no specified end date
        And I should be the person with the returned role
        And there should be no elections for the returned role
        And there should be 1 role owner for the returned role
        And there should be no evaluations for the returned role

    Scenario: Creating a role with an identical name to an existing role
        Given I have a users token
        And a circle, "Cool Circle", to which I belong
        And the circle has a role "Boombox Player"
        When I create a role "Boombox Player" for myself
        Then I should receive a HTTP 201 response with the following object as `role`:
        | title       | Boombox Player   |
        | roleId      | boombox-player-1 |
        And I should be the person with the returned role
        And the term on the returned role should start today, and have no specified end date
        And there should be no area of responsibility for the returned role
        And there should be no desired characteristics for the returned role
        And there should be no elections for the returned role
        And there should be 1 role owner for the returned role
        And there should be no evaluations for the returned role

    Scenario: Retrieving a role
        Given I have a users token
        And a circle, "Cool Circle", to which I belong
        And the circle has a role "Bridge Builder", which I have, with the following data:
        | areaOfResponsibility   | Deal the poker cards                                               |
        | desiredCharacteristics | A swift hand, low tendency to pack the deck to anyone's advantage. |
        When I request the role with ID "bridge-builder"
        Then I should receive a HTTP 200 response with the following object as `role`:
        | title                  | Bridge Builder                                                     |
        | roleId                 | bridge-builder                                                     |
        | areaOfResponsibility   | Deal the poker cards                                               |
        | desiredCharacteristics | A swift hand, low tendency to pack the deck to anyone's advantage. |
        And the term on the returned role should start today, and have no specified end date
        And I should be the person with the returned role
        And there should be no elections for the returned role
        And there should be 1 role owner for the returned role
        And there should be no evaluations for the returned role

    Scenario: Retrieving a non-existing role
        Given I have a users token
        And a circle, "Cool Circle", to which I belong
        When I request the role with ID "other-role"
        Then I should receive a HTTP 404 code response

    Scenario: Retrieving a list of roles
        Given I have a users token
        And a circle, "Banana Circle", to which I belong
        And the circle has a role "Bridge Builder", which I have
        And the circle has a role "Power Tool Wielder"
        When I request the role list
        Then I should receive a HTTP 200 code response with a list of the following roles:
        | title              | roleId             |
        | Bridge Builder     | bridge-builder     |
        | Power Tool Wielder | power-tool-wielder |

    Scenario: Deleting a role
        Given I have a users token
        And a circle, "Burger Circle", to which I belong
        And the circle has a role "Bridge Builder", which I have
        When I delete the role with ID "bridge-builder"
        Then I should receive a HTTP 204 code response
        And no task with ID "bridge-builder" should exist

    Scenario: Updating a role
        Given I have a users token
        And a circle, "Cake Circle", to which I belong
        And the circle has a role "Bridge Builder", which I have
        When I update the role with ID "bridge-builder" with the following data:
        | title                  | Tunnel Digger                                  |
        | areaOfResponsibility   | Dig tunnels                                    |
        | desiredCharacteristics | Gruff voices appreciated.                      |
        Then I should receive a HTTP 200 response with the following object as `role`:
        | title                  | Tunnel Digger                                  |
        | roleId                 | bridge-builder                                 |
        | areaOfResponsibility   | Dig tunnels                                    |
        | desiredCharacteristics | Gruff voices appreciated.                      |
        And the term on the returned role should start today, and have no specified end date
        And I should be the person with the returned role
        And there should be no elections for the returned role
        And there should be 1 role owner for the returned role
        And there should be no evaluations for the returned role
