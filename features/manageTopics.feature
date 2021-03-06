Feature: Manage topics
    As a user
    I want to be able to perform CRUD on topics in a circle
    So that I can use the collaboration tools of topics in circles

    Scenario: Creating a topic
        Given I have a users token
            And I have a circle called "Cool Circle"
# TODO: Would it not be more correct to say "belong to a circle"?
            And I want to create a topic
            And I want the title of the topic to be "Cool Topic"
        When I create the topic
        Then I receive a HTTP 201 code
            And I receive a topic object
            And the title of the topic is "Cool Topic"

    Scenario: Retrieving a topic
        Given I have a users token
            And I have a circle called "Awesome Circle"
            And I have a topic called "Awesome Topic"
# TODO: Wouldn't it be more correct to say "and the circle has..."?
        When I request the topic called "Awesome Topic"
        Then I receive a HTTP 200 code
          And I receive a topic object
          And the title of the topic is "Awesome Topic"

# TODO: From here on, all the Scenarios are called the same! Must be an error.
    Scenario: Retrieving a non-existing topic
        Given I have a users token
            And I have a circle called "Decent Circle"
        When I request the topic called "Decent Topic"
        Then I receive a HTTP 404 code

    Scenario: Retrieving a non-existing topic
        Given I have a users token
            And I have a circle called "Banana Circle"
            And I have a topic called "Apple Topic"
            And I have a topic called "Orange Topic"
        When I request the topic list
        Then I receive a list of topics
# TODO: For consistency, this should mention the HTTP response code
            And one topic called "Apple Topic"
            And one topic called "Orange Topic"

# TODO: This is bad test design! (Multiple When statements!) Suggestion: "Then the task list does not contain..."
    Scenario: Retrieving a non-existing topic
        Given I have a users token
            And I have a circle called "Burger Circle"
            And I have a topic called "Apple Topic"
        When I delete the topic called "Apple Topic"
        Then I receive a HTTP 204 code
        When I request the topic called "Apple Topic"
        Then I receive a HTTP 404 code

    Scenario: Updating a topic
        Given I have a users token
            And I have a circle called "Cake Circle"
            And I have a topic called "Apple Topic"
            And I want to update a topic
            And I want the why of the topic to be "just because"
        When I update the topic called "Apple Topic"
        Then I receive a HTTP 200 code
            And I receive a topic object
            And the why of the topic is "just because"
