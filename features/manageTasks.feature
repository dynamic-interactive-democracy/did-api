Feature: Manage tasks
    As a user in a circle
    I want to be able to manage tasks on my circle
    So that I can coordinate what needs to be done with other members of the circle

    Scenario: Creating a task with only a name
        Given I have a users token
        And a circle, "Cool Circle", to which I belong
        When I create a task "Get coffee for boss"
        Then I should receive a HTTP 201 code response with the following task object as `task`:
        | title       | Get coffee for boss |
        | taskId      | get-coffee-for-boss |
        | status      | onSchedule          |
        | description |                     |
        | aim         |                     |
        And I should be the owner of the returned task
        And there should be no due date set for the returned task

    Scenario: Creating a task with much information
        Given I have a users token
        And a circle, "Cool Circle", to which I belong
        When I create a task "Get coffee for boss" with the following data:
        | dueDate     | 2125-09-10       |
        | status      | aheadOfSchedule  |
        | description | A soy mocha      |
        | aim         | Make boss happy! |
        Then I should receive a HTTP 201 code response with the following task object as `task`:
        | title       | Get coffee for boss |
        | taskId      | get-coffee-for-boss |
        | status      | aheadOfSchedule     |
        | dueDate     | 2125-09-10          |
        | description | A soy mocha         |
        | aim         | Make boss happy!    |
        And I should be the owner of the returned task

    Scenario: Creating a task with an identical name to an existing task
        Given I have a users token
        And a circle, "Cool Circle", to which I belong
        And the circle has a task "Awesome Task", which I own
        When I create a task "Awesome Task"
        Then I should receive a HTTP 201 code response with the following task object as `task`:
        | title       | Awesome Task   |
        | taskId      | awesome-task-1 |
        | status      | onSchedule     |
        | description |                |
        | aim         |                |
        And I should be the owner of the returned task
        And there should be no due date set for the returned task

    Scenario: Retrieving a task
        Given I have a users token
        And a circle, "Cool Circle", to which I belong
        And the circle has a task "Awesome Task", which I own, with the following data:
        | dueDate     | 2125-09-10            |
        | status      | onSchedule            |
        | description | A happy task!         |
        | aim         | Bring about happiness |
        When I request the task with ID "awesome-task"
        Then I should receive a HTTP 200 code response with the following task object as `task`:
        | title       | Awesome Task          |
        | taskId      | awesome-task          |
        | dueDate     | 2125-09-10            |
        | status      | onSchedule            |
        | description | A happy task!         |
        | aim         | Bring about happiness |
        And I should be the owner of the returned task

    Scenario: Retrieving a non-existing task
        Given I have a users token
        And a circle, "Cool Circle", to which I belong
        When I request the task with ID "decent-task"
        Then I should receive a HTTP 404 code response

    Scenario: Retrieving a list of tasks
        Given I have a users token
        And a circle, "Banana Circle", to which I belong
        And the circle has a task "Apple Task", which I own
        And the circle has a task "Orange Task"
        When I request the task list
        Then I should receive a HTTP 200 code response with a list of the following tasks:
        | title       | taskId      |
        | Apple Task  | apple-task  |
        | Orange Task | orange-task |

    Scenario: Deleting a task
        Given I have a users token
        And a circle, "Burger Circle", to which I belong
        And the circle has a task "Apple Task", which I own
        When I delete the task with ID "apple-task"
        Then I should receive a HTTP 204 code response
        And no task with ID "apple-task" should exist

    Scenario: Updating a task
        Given I have a users token
        And a circle, "Cake Circle", to which I belong
        And the circle has a task "Apple Task", which I own
        When I update the task with ID "apple-task" with the following data:
        | title       | Nueve Apple Task   |
        | description | remember frosting  |
        | aim         | to delight eaters! |
        Then I should receive a HTTP 200 code response with the following task object as `task`:
        | title       | Nueve Apple Task   |
        | taskId      | apple-task         |
        | status      | onSchedule         |
        | description | remember frosting  |
        | aim         | to delight eaters! |
        And I should be the owner of the returned task
        And there should be no due date set for the returned task
