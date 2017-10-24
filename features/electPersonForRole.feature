Feature: Elect person for role
    As a member of a circle
    I want to be able to hold elections for roles
    In order to pick the best fit for a role

    Scenario: Start election
        Given I have a users token
        And a circle, "Cake Circle", to which I belong
        And the circle has a role "Bridge Builder"
        When I start an election for the following term:
        | start | 2153-01-01 |
        | end   | 2153-12-31 |
        Then I should receive a HTTP 201 response with the following object as `election`:
        | state | firstRound |
        And the term of the returned election should start on 2153-01-01
        And the term of the returned election should end on 2153-12-31
        And the returned election should have no nominations
        And the returned election should have no electee
        And the returned election should have no summary
        And the returned election should have no completion date

    Scenario: Try to start election while one is ongoing
        Given I have a users token
        And a circle, "Cake Circle", to which I belong
        And the circle has a role "Bridge Builder"
        And I have started an election for the following term:
        | start | 2199-01-01 |
        | end   | 2199-12-31 |
        When I start an election for the following term:
        | start | 2153-01-01 |
        | end   | 2153-12-31 |
        Then I should receive a HTTP 403 response

    Scenario: Make nomination
        Given I have a users token
        And a user "Jake the Dog" exists
        And a circle, "Cake Circle", to which I belong
        And the circle has a role "Bridge Builder"
        And the role has an election for the following term:
        | start | 2153-01-01 |
        | end   | 2153-12-31 |
        When I make a nomination with nominee "Jake the Dog"
        Then I should receive a HTTP 201 response with an object as `nomination`
        And the nominator of the returned nomination should be me
        And the nominee of the returned nomination should be "Jake the Dog"
        And there should be no change round nominee on the returned nomination

    Scenario: Try to make a nomination when one already exists
        Given I have a users token
        And a user "Jake the Dog" exists
        And a user "Finn the Human" exists
        And a circle, "Cake Circle", to which I belong
        And the circle has a role "Bridge Builder"
        And the role has an election for the following term:
        | start | 2153-01-01 |
        | end   | 2153-12-31 |
        And I have made a nomination with nominee "Jake the Dog"
        When I make a nomination with nominee "Finn the Human"
        Then I should receive a HTTP 403 response

    Scenario: Update a nomination
        Given I have a users token
        And a user "Jake the Dog" exists
        And a user "Finn the Human" exists
        And a circle, "Cake Circle", to which I belong
        And the circle has a role "Bridge Builder"
        And the role has an election for the following term:
        | start | 2153-01-01 |
        | end   | 2153-12-31 |
        And I have made a nomination with nominee "Jake the Dog"
        When I update my nomination with nominee "Finn the Human"
        Then I should receive a HTTP 200 response with an object as `nomination`
        And the nominator of the returned nomination should be me
        And the nominee of the returned nomination should be "Finn the Human"
        And there should be no change round nominee on the returned nomination

    Scenario: Try to make a regular nomination in the change round
        Given I have a users token
        And a user "Jake the Dog" exists
        And a circle, "Cake Circle", to which I belong
        And the circle has a role "Bridge Builder"
        And the role has an election for the following term:
        | start | 2153-01-01 |
        | end   | 2153-12-31 |
        And I have moved the election to the change round
        When I make a nomination with nominee "Jake the Dog"
        Then I should receive a HTTP 403 response

    Scenario: Move to change round
        Given I have a users token
        And a user "Jake the Dog" exists
        And a circle, "Cake Circle", to which I belong
        And the circle has a role "Bridge Builder"
        And the role has an election for the following term:
        | start | 2153-01-01 |
        | end   | 2153-12-31 |
        And I have made a nomination with nominee "Jake the Dog"
        When I move the election to the change round
        Then I should receive a HTTP 200 response with the following object as `election`:
        | state | secondRound |
        And the term of the returned election should start on 2153-01-01
        And the term of the returned election should end on 2153-12-31
        And the returned election should have no electee
        And the returned election should have no summary
        And the returned election should contain a nomination of "Jake the Dog" by me and with no change round nominee
        And the returned election should have no completion date

    Scenario: Make change round nomination
        Given I have a users token
        And a user "Jake the Dog" exists
        And a user "Finn the Human" exists
        And a circle, "Cake Circle", to which I belong
        And the circle has a role "Bridge Builder"
        And the role has an election for the following term:
        | start | 2153-01-01 |
        | end   | 2153-12-31 |
        And I have made a nomination with nominee "Jake the Dog"
        And I have moved the election to the change round
        When I update my nomination with change round nominee "Finn the Human"
        Then I should receive a HTTP 200 response with an object as `nomination`
        And the nominator of the returned nomination should be me
        And the nominee of the returned nomination should be "Jake the Dog"
        And the change round nominee of the returned nomination should be "Finn the Human"

    Scenario: Try to make change round nomination in first round
        Given I have a users token
        And a user "Jake the Dog" exists
        And a user "Finn the Human" exists
        And a circle, "Cake Circle", to which I belong
        And the circle has a role "Bridge Builder"
        And the role has an election for the following term:
        | start | 2153-01-01 |
        | end   | 2153-12-31 |
        And I have made a nomination with nominee "Jake the Dog"
        When I update my nomination with change round nominee "Finn the Human"
        Then I should receive a HTTP 403 response

    Scenario: Make change round nomination without having made a nomination in the first round
        Given I have a users token
        And a user "Jake the Dog" exists
        And a user "Finn the Human" exists
        And a circle, "Cake Circle", to which I belong
        And the circle has a role "Bridge Builder"
        And the role has an election for the following term:
        | start | 2153-01-01 |
        | end   | 2153-12-31 |
        And I have moved the election to the change round
        When I make a nomination with change round nominee "Finn the Human"
        Then I should receive a HTTP 201 response with an object as `nomination`
        And the nominator of the returned nomination should be me
        And there should be no nominee on the returned nomination
        And the change round nominee of the returned nomination should be "Finn the Human"

    Scenario: Try to make change round nomination in first round without having made a regular nomination
        Given I have a users token
        And a user "Jake the Dog" exists
        And a user "Finn the Human" exists
        And a circle, "Cake Circle", to which I belong
        And the circle has a role "Bridge Builder"
        And the role has an election for the following term:
        | start | 2153-01-01 |
        | end   | 2153-12-31 |
        When I make a nomination with change round nominee "Finn the Human"
        Then I should receive a HTTP 403 response

    Scenario: Complete election
        Given I have a users token
        And a user "Jake the Dog" exists
        And a user "Finn the Human" exists
        And a circle, "Cake Circle", to which I belong
        And the circle has a role "Bridge Builder"
        And the role has an election for the following term:
        | start | 2153-01-01 |
        | end   | 2153-12-31 |
        And I have made a nomination with nominee "Jake the Dog"
        And I have moved the election to the change round
        And I have updated my nomination with change round nominee "Finn the Human"
        When I complete the election with "Jake the Dog" as electee and the following data:
        | summary | We talked about it, and Jake is going to be prez. |
        Then I should receive a HTTP 200 response with the following object as `election`:
        | state   | completed                                         |
        | summary | We talked about it, and Jake is going to be prez. |
        And the term of the returned election should start on 2153-01-01
        And the term of the returned election should end on 2153-12-31
        And the returned election should have "Jake the Dog" as electee
        And the returned election should contain a nomination of "Jake the Dog" by me and with "Finn the Human" as change round nominee
        And the returned election should have today's date as its completion date
        And the returned election should have a fully qualified datetime as its completion date

    Scenario: View election result, and previous role owners
        Given I have a users token
        And a user "Jake the Dog" exists
        And a user "Finn the Human" exists
        And a circle, "Cake Circle", to which I belong
        And the circle has a role "Bridge Builder"
        And the role has an election for the following term:
        | start | 2153-01-01 |
        | end   | 2153-12-31 |
        And I have made a nomination with nominee "Jake the Dog"
        And I have moved the election to the change round
        And I have updated my nomination with change round nominee "Finn the Human"
        And I have completed the election with "Jake the Dog" as electee and the following data:
        | summary | We talked about it, and Jake is going to be prez. |
        When I request the role with ID "bridge-builder"
        Then I should receive a HTTP 200 response with the following object as `role`:
        | title  | Bridge Builder |
        | roleId | bridge-builder |
        And the returned role should contain an election
        And the contained election should have the following data:
        | state   | completed                                         |
        | summary | We talked about it, and Jake is going to be prez. |
        And the term of the contained election should start on 2153-01-01
        And the term of the contained election should end on 2153-12-31
        And the contained election should have "Jake the Dog" as electee
        And the contained election should contain a nomination of "Jake the Dog" by me and with "Finn the Human" as change round nominee
        And the contained election should have today's date as its completion date
        And the contained election should have a fully qualified datetime as its completion date
