/* eslint new-cap: 0 */

const cucumber = require("cucumber");
const assert = require("assert");
const request = require("request");
const _ = require("lodash");

cucumber.defineSupportCode(function({ Given, When, Then }) {
    When(/^I create a task "([^"]+)"$/, function(taskName, callback) {
        createTask.call(this, { title: taskName}, callback);
    });

    function createTask(data, callback) {
        request.post({
            url: `${this.url}/circles/${this.circle.circleId}/tasks`,
            body: data,
            json: true,
            auth: {
                user: this.userId,
                pass: this.token
            }
        }, (error, response, body) => {
            this.error = error;
            this.response = response;
            this.body = body;

            callback();
        });
    }

    When(/^I create a task "([^"]+)" with the following data:$/, function(taskName, table, callback) {
        let data = table.rowsHash();
        data.title = taskName;
        createTask.call(this, data, callback);
    });

    Given(/^the circle has a task "([^"]+)"(, which I own)?$/, function(taskName, isOwner, callback) {
        if(isOwner) {
            return ensureTask.call(this, { title: taskName }, callback);
        }
        else {
            return ensureTask.call(this, { title: taskName }, callback); //TODO: Should change owner!
        }
    });

    function ensureTask(data, callback) {
        createTask.call(this, data, (error) => {
            if(error) {
                return callback(error);
            }
            if(this.response.statusCode != 201) {
                return callback(new Error("Trying to ensure a task failed: creation returned " + this.response.statusCode + " instead of 201."));
            }
            callback();
        });
    }

    Given(/^the circle has a task "([^"]+)"(, which I own)?, with the following data:$/, function(taskName, isOwner, table, callback) {
        if(isOwner) {
            let data = table.rowsHash();
            data.title = taskName;
            return ensureTask.call(this, data, callback);
        }
        else {
            callback(null, 'pending');
        }
    });

    Then(/^I should receive a HTTP ([0-9]{3}) code response$/, function(responseCode, callback) {
        if(this.response.statusCode != responseCode) {
            return callback(new Error("Expected HTTP response code " + responseCode + " but got " + this.response.statusCode + ": " + this.body));
        }
        callback();
    });

    Then(/^I should receive a HTTP ([0-9]{3}) code response with the following task object as `(task)`:$/, function(responseCode, taskKey, table, callback) {
        assertTaskObjectResponse.call(this, responseCode, body => body[taskKey], table, callback);
    });

    function assertTaskObjectResponse(responseCode, taskSelector, table, callback) {
        if(this.response.statusCode != responseCode) {
            return callback(new Error("Expected HTTP response code " + responseCode + " but got " + this.response.statusCode + ": " + this.body));
        }
        if(!this.body || typeof this.body !== "object") {
            return callback(new Error("No valid body was returned from the request"));
        }
        let task = taskSelector(this.body);
        let expectedTask = table.rowsHash();
        let mismatchKeys = Object.keys(expectedTask).filter(key => expectedTask[key] != task[key]);
        if(mismatchKeys.length) {
            let mismatches = mismatchKeys.map(key => {
                return {
                    key,
                    expected: expectedTask[key],
                    actual: task[key] || null
                };
            });
            return callback(new Error("Expected task did not match actual task. Mismatches: " + JSON.stringify(mismatches, null, 2)));
        }
        this.returnedTask = task;
        callback();
    }

    Then(/^I should receive a HTTP ([0-9]{3}) code response with the following task object:$/, function(responseCode, table, callback) {
        assertTaskObjectResponse.call(this, responseCode, body => body, table, callback);
    });

    Then(/^I should be the owner of the returned task$/, function(callback) {
        if(this.returnedTask.owner != this.userId) {
            return callback(new Error("Expected to be owner of task, but the owner was " + this.returnedTask.owner + ", not " + this.userId + " as expected."));
        }
        callback();
    });

    Then(/^there should be no due date set for the returned task$/, function(callback) {
        if(this.returnedTask.dueDate != null) {
            return callback(new Error("Expected no due date on returned task, but due date was " + this.returnedTask.dueDate));
        }
        callback();
    });

    When(/^I request the task with ID "([^"]+)"$/, function(taskId, callback) {
        request.get({
            url: `${this.url}/circles/${this.circle.circleId}/tasks/${taskId}`,
            json: true,
            auth: {
                user: this.userId,
                pass: this.token
            }
        }, (error, response, body) => {
            this.error = error;
            this.response = response;
            this.body = body;

            callback();
        });
    });

    When(/^I request the task list$/, function(callback) {
        requestTaskList.call(this, callback);
    });

    function requestTaskList(callback) {
        request.get({
            url: `${this.url}/circles/${this.circle.circleId}/tasks`,
            json: true,
            auth: {
                user: this.userId,
                pass: this.token
            }
        }, (error, response, body) => {
            this.error = error;
            this.response = response;
            this.body = body;

            callback();
        });
    }

    Then(/^I should receive a HTTP ([^"]+) code response with a list of the following tasks:$/, function(responseCode, table, callback) {
        if(this.response.statusCode != responseCode) {
            return callback(new Error("Expected HTTP response code " + responseCode + " but got " + this.response.statusCode + ": " + this.body));
        }
        let mismatchingTasks = table.hashes().filter(expectedTask => taskHasNoMatches(expectedTask, this.body.tasks));
        if(mismatchingTasks.length) {
            return callback(new Error("Actual tasks returned did not match expectation. " + JSON.stringify({ expected: mismatchingTasks, actual: this.body.tasks }, null, 2)));
        }
        callback();
    });

    function taskHasNoMatches(expectedTask, actualTasks) {
        return !actualTasks.find(actualTask => Object.keys(expectedTask).every(key => expectedTask[key] == actualTask[key]));
    }

    When(/^I delete the task with ID "([^"]+)"$/, function(taskId, callback) {
        request.delete({
            url: `${this.url}/circles/${this.circle.circleId}/tasks/${taskId}`,
            json: true,
            auth: {
                user: this.userId,
                pass: this.token
            }
        }, (error, response, body) => {
            this.error = error;
            this.response = response;
            this.body = body;

            callback();
        });
    });

    Then(/^no task with ID "([^"]+)" should exist$/, function(taskId, callback) {
        requestTaskList.call(this, error => {
            if(error) {
                return callback(error);
            }
            let matchingTask = this.body.tasks.find(task => task.taskId == taskId);
            if(matchingTask) {
                return callback(new Error("Expected to find no task with matching task ID " + taskId + " but found " + JSON.stringify(matchingTask, null, 2)));
            }
            callback();
        });
    });

    When(/^I update the task with ID "(.*)" with the following data:$/, function(taskId, table, callback) {
        request.put({
            url: `${this.url}/circles/${this.circle.circleId}/tasks/${taskId}`,
            body: table.rowsHash(),
            json: true,
            auth: {
                user: this.userId,
                pass: this.token
            }
        }, (error, response, body) => {
            this.error = error;
            this.response = response;
            this.body = body;

            callback();
        });
    });
});
