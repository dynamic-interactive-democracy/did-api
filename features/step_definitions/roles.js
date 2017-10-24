/* eslint new-cap: 0 */

const cucumber = require("cucumber");
const assert = require("assert");
const request = require("request");
const _ = require("lodash");

cucumber.defineSupportCode(function({ Given, When, Then }) {
    When(/^I create a role "([^"]+)" for myself with the following data:$/, function(roleName, table, callback) {
        let data = table.rowsHash();
        data.title = roleName;
        createRole.call(this, data, callback);
    });

    function createRole(data, callback) {
        request.post({
            url: `${this.url}/circles/${this.circle.circleId}/roles`,
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
            this.role = (body && body.role) ? body.role : null;

            callback();
        });
    }

    Then(/^I should be the person with the returned role$/, function(callback) {
        if(this.returned.role.person == this.userId) {
            return callback();
        }
        callback(new Error(`Returned role is owned by ${this.returned.role.person}. Expected it to be owned my be (${this.userId}).`));
    });

    Then(/^there should be no elections for the returned role$/, function(callback) {
        let { elections } = this.returned.role;
        if(!Array.isArray(elections) || elections.length > 0) {
            return callback(new Error("Expected no elections, but found: " + JSON.stringify(elections)));
        }
        callback();
    });

    Then(/^there should be no previous role owners for the returned role$/, function(callback) {
        let { previousRoleOwners } = this.returned.role;
        if(!Array.isArray(previousRoleOwners) || previousRoleOwners.length > 0) {
            return callback(new Error("Expected no previous owners, but found: " + JSON.stringify(previousRoleOwners)));
        }
        callback();
    });

    Then(/^there should be ([0-9]+) role owners? for the returned role$/, function(numRoleOwners, callback) {
        assertEquals("number of role owners", this.returned.role.roleOwners.length, parseInt(numRoleOwners), callback);
    });

    Then(/^there should be no evaluations for the returned role$/, function(callback) {
        let { evaluations } = this.returned.role;
        if(!Array.isArray(evaluations) || evaluations.length > 0) {
            return callback(new Error("Expected no previous owners, but found: " + JSON.stringify(evaluations)));
        }
        callback();
    });

    Given(/^the circle has a role "([^"]+)"$/, function(roleName, callback) {
        //TODO: Should someone else own this role? Dunno.
        createRole.call(this, { title: roleName }, callback);
    });

    Given(/^the circle has a role "([^"]+)", which I have$/, function(roleName, callback) {
        createRole.call(this, { title: roleName }, callback);
    });

    Given(/^the circle has a role "([^"]+)", which I have, with the following data:$/, function(roleName, table, callback) {
        let data = table.rowsHash();
        data.title = roleName;
        createRole.call(this, data, callback);
    });

    When(/^I create a role "([^"]+)" for myself$/, function(roleName, callback) {
        createRole.call(this, { title: roleName }, callback);
    });

    Then(/^the term on the returned role should start today, and have no specified end date$/, function(callback) {
        let { term } = this.returned.role;
        if(!term) {
            return callback(new Error(`Expected a term, but found ${JSON.stringify(term)}`));
        }
        let today = (new Date()).toISOString().substring(0, 10);
        if(term.start != today) {
            return callback(new Error(`Expected start date ${today}, but found ${term.start}`));
        }
        if(term.end != null) {
            return callback(new Error(`Expected no end date, but found ${term.end}`));
        }
        callback();
    });

    Then(/^there should be no term for the returned role$/, function(callback) {
        if(this.returned.role.term == null) {
            return callback();
        }
        callback(new Error("Expected no term, but found " + JSON.stringify(this.returned.role.term)));
    });

    Then(/^there should be no area of responsibility for the returned role$/, function(callback) {
        if(this.returned.role.areaOfResponsibility == "") {
            return callback();
        }
        callback(new Error("Expected no area of responsibility, but found " + this.returned.role.areaOfResponsibility));
    });

    Then(/^there should be no desired characteristics for the returned role$/, function(callback) {
        if(this.returned.role.desiredCharacteristics == "") {
            return callback();
        }
        callback(new Error("Expected no desired characteristics, but found " + this.returned.role.desiredCharacteristics));
    });

    When(/^I request the role with ID "([^"]+)"$/, function(roleId, callback) {
        getRole.call(this, roleId, callback);
    });

    function getRole(id, callback) {
        request.get({
            url: `${this.url}/circles/${this.circle.circleId}/roles/${id}`,
            auth: {
                user: this.userId,
                pass: this.token
            },
            json: true
        }, (error, response, body) => {
            this.error = error;
            this.response = response;
            this.body = body;

            callback();
        });
    }

    When(/^I request the role list$/, function(callback) {
        request.get({
            url: `${this.url}/circles/${this.circle.circleId}/roles`,
            auth: {
                user: this.userId,
                pass: this.token
            },
            json: true
        }, (error, response, body) => {
            this.error = error;
            this.response = response;
            this.body = body;

            callback();
        });
    });

    Then(/^I should receive a HTTP ([0-9]{3}) code response with a list of the following roles:$/, function(responseCode, table, callback) {
        if(this.response.statusCode != responseCode) {
            return callback(new Error("Expected HTTP response code " + responseCode + " but got " + this.response.statusCode + ": " + this.body));
        }
        if(!this.body.roles) {
            return callback(new Error("No roles returned in body. Got: " + JSON.stringify(this.body)));
        }
        let mismatchingRoles = table.hashes().filter(expectedRole => roleHasNoMatches(expectedRole, this.body.roles));
        if(mismatchingRoles.length) {
            return callback(new Error("Actual roles returned did not match expectation. " + JSON.stringify({ expected: mismatchingRoles, actual: this.body.roles }, null, 2)));
        }
        callback();
    });

    function roleHasNoMatches(expectedRole, actualRoles) {
        return !actualRoles.find(actualRole => Object.keys(expectedRole).every(key => expectedRole[key] == actualRole[key]));
    }

    When(/^I update the role with ID "([^"]+)" with the following data:$/, function(roleId, table, callback) {
        updateRole.call(this, roleId, table.rowsHash(), callback);
    });

    function updateRole(id, data, callback) {
        request.put({
            url: `${this.url}/circles/${this.circle.circleId}/roles/${id}`,
            auth: {
                user: this.userId,
                pass: this.token
            },
            json: true,
            body: data
        }, (error, response, body) => {
            this.error = error;
            this.response = response;
            this.body = body;

            callback();
        });
    }

    When(/^I delete the role with ID "([^"]+)"$/, function(roleId, callback) {
        request.delete({
            url: `${this.url}/circles/${this.circle.circleId}/roles/${roleId}`,
            auth: {
                user: this.userId,
                pass: this.token
            },
            json: true
        }, (error, response, body) => {
            this.error = error;
            this.response = response;
            this.body = body;

            callback();
        });
    });

    // EVALUATIONS

    When(/^I evaluate the role with ID "([^"]+)" with the following data:$/, function(roleId, table, callback) {
        createEvaluation.call(this, roleId, table.rowsHash(), callback);
    });

    function createEvaluation(roleId, data, callback) {
        request.post({
            url: `${this.url}/circles/${this.circle.circleId}/roles/${roleId}/evaluations`,
            auth: {
                user: this.userId,
                pass: this.token
            },
            body: data,
            json: true
        }, (error, response, body) => {
            this.error = error;
            this.response = response;
            this.body = body;

            callback();
        });
    }

    Then(/^I should receive a HTTP ([0-9]{3}) response with the following object as `(.*)`:$/, function(responseCode, objectName, table, callback) {
        assertObjectByName.call(this, responseCode, objectName, (error, obj) => {
            if(error) {
                return callback(error);
            }
            ensureObjectMatch.call(this, objectName, obj, table.rowsHash(), callback);
        });
    });

    function ensureObjectMatch(objectName, obj, expectedObject, callback) {
        let mismatchKeys = Object.keys(expectedObject).filter(key => expectedObject[key] != obj[key]);
        if(mismatchKeys.length) {
            let mismatches = mismatchKeys.map(key => {
                return {
                    key,
                    expected: expectedObject[key],
                    actual: obj[key] || null
                };
            });
            return callback(new Error(`Expected object did not match actual object in \`${objectName}\`. Mismatches: ${JSON.stringify(mismatches, null, 2)}`));
        }
        callback();
    }

    function assertObjectByName(responseCode, objectName, callback) {
        if(this.response.statusCode != responseCode) {
            return callback(new Error("Expected HTTP response code " + responseCode + " but got " + this.response.statusCode + ": " + JSON.stringify(this.body)));
        }
        if(!this.body || typeof this.body !== "object") {
            return callback(new Error("No valid body was returned from the request"));
        }
        let obj = this.body[objectName];
        this.returned = { [objectName]: obj };
        callback(null, obj);
    }

    Then(/^I should receive a HTTP ([0-9]{3}) response with an object as `(.*)`$/, function(responseCode, objectName, callback) {
        assertObjectByName.call(this, responseCode, objectName, callback);
    });

    Then(/^the date of the evaluation should be today's date$/, function(callback) {
        assertEquals("evaluation date", this.returned.evaluation.date, (new Date()).toISOString().substring(0, 10), callback);
    });

    function assertEquals(name, actual, expected, callback) {
        assertThis(name, expected === actual, actual, expected, callback);
    }

    function assertThis(name, success, actual, expected, callback) {
        if(!success) {
            return callback(new Error(`Expected ${name} to be ${expected}, but found ${actual}.`));
        }
        callback();
    }

    Given(/^an evaluation has been given to the role with ID "([^"]+)" with the following data:$/, function(roleId, table, callback) {
        createEvaluation.call(this, roleId, table.rowsHash(), callback);
    });

    Then(/^there should be ([0-9]+) evaluations on the returned role$/, function(numEvaluations, callback) {
        assertEquals("number of evaluations", this.returned.role.evaluations.length, parseInt(numEvaluations), callback);
    });

    Then(/^the following evaluations should exist on the returned role:$/, function(table, callback) {
        let expectedEvaluations = table.hashes();
        let evaluations = this.returned.role.evaluations;

        let allEvaluationsFound = expectedEvaluations.every(expectedEvaluation =>
            evaluations.some(evaluation =>
                Object.keys(expectedEvaluation).every(key => expectedEvaluation[key] == evaluation[key])
            )
        );

        if(!allEvaluationsFound) {
            return callback(new Error(`Did not find all expected evaluations. Expected ${JSON.stringify(expectedEvaluations)}, but found ${JSON.stringify(evaluations)}.`));
        }
        callback();
    });

    // ELECTIONS

    When(/^I start an election for the following term:$/, function(table, callback) {
        startElection.call(this, table.rowsHash(), callback);
    });

    function startElection(data, callback) {
        request.post({
            url: `${this.url}/circles/${this.circle.circleId}/roles/${this.role.roleId}/elections`,
            auth: {
                user: this.userId,
                pass: this.token
            },
            body: data,
            json: true
        }, (error, response, body) => {
            this.error = error;
            this.response = response;
            this.body = body;

            callback();
        });
    }

    Given(/^I have started an election for the following term:$/, function(table, callback) {
        startElection.call(this, table.rowsHash(), callback);
    });

    Given(/^the role has an election for the following term:$/, function(table, callback) {
        startElection.call(this, table.rowsHash(), callback);
    });

    Then(/^the term of the returned election should (start|end) on ([0-9\-]+)$/, function(key, date, callback) {
        assertEquals(`term ${key}`, this.returned.election.term[key], date, callback);
    });

    Then(/^the returned election should have no nominations$/, function(callback) {
        assertEmptyArray(`nominations`, this.returned.election.nominations, callback);
    });

    function assertEmptyArray(name, actual, callback) {
        assertThis(name, Array.isArray(actual) && actual.length == 0, actual, "[]", callback);
    }

    Then(/^the returned election should have no (electee|summary)$/, function(field, callback) {
        assertEquals(field, this.returned.election[field], null, callback);
    });

    Then(/^the returned election should have no completion date$/, function(callback) {
        assertEquals("completedAt", this.returned.election.completedAt, null, callback);
    });

    Then(/^I should receive a HTTP ([0-9]+) response$/, function(responseCode, callback) {
        if(this.response.statusCode != responseCode) {
            return callback(new Error("Expected HTTP response code " + responseCode + " but got " + this.response.statusCode + ": " + JSON.stringify(this.body)));
        }
        callback();
    });

    When(/^I make a nomination with nominee "([^"]+)"$/, function(name, callback) {
        makeNominationByName.call(this, name, "nominee", callback);
    });

    When(/^I make a nomination with change round nominee "([^"]+)"$/, function(name, callback) {
        makeNominationByName.call(this, name, "changeRoundNominee", callback);
    });

    function makeNominationByName(name, fieldName, callback) {
        findUser.call(this, name, (error, user) => {
            if(error) {
                return callback(error);
            }
            makeNomination.call(this, { [fieldName]: user.userId }, callback);
        });
    }

    function findUser(name, callback) {
        let user = this.users.find((user) => user.name == name);
        if(!user) {
            return callback(new Error(`No user with name ${name} found`));
        }
        callback(null, user);
    }

    function makeNomination(data, callback) {
        request.post({
            url: `${this.url}/circles/${this.circle.circleId}/roles/${this.role.roleId}/elections/nominations`,
            auth: {
                user: this.userId,
                pass: this.token
            },
            body: data,
            json: true
        }, (error, response, body) => {
            this.error = error;
            this.response = response;
            this.body = body;

            callback();
        });
    }

    Then(/^the nominator of the returned nomination should be me$/, function(callback) {
        assertEquals("nominator", this.returned.nomination.nominator, this.userId, callback);
    });

    Then(/^the nominee of the returned nomination should be "([^"]+)"$/, function(name, callback) {
        findUser.call(this, name, (error, user) => {
            if(error) {
                return callback(error);
            }
            assertEquals("nominee", this.returned.nomination.nominee, user.userId, callback);
        });
    });

    Then(/^there should be no nominee on the returned nomination$/, function(callback) {
        assertEquals("nominee", this.returned.nomination.nominee, null, callback);
    });

    Then(/^there should be no change round nominee on the returned nomination$/, function(callback) {
        assertEquals("change round nominee", this.returned.nomination.changeRoundNominee, null, callback);
    });

    Given(/^I have made a nomination with nominee "([^"]+)"$/, function(name, callback) {
         makeNominationByName.call(this, name, "nominee", callback);
    });

    When(/^I move the election to the change round$/, function(callback) {
        updateElection.call(this, { state: "secondRound" }, callback);
    });

    function updateElection(data, callback) {
        request.put({
            url: `${this.url}/circles/${this.circle.circleId}/roles/${this.role.roleId}/elections`,
            auth: {
                user: this.userId,
                pass: this.token
            },
            body: data,
            json: true
        }, (error, response, body) => {
            this.error = error;
            this.response = response;
            this.body = body;

            callback();
        });
    }

    Then(/^the returned election should contain a nomination of "([^"]+)" by me and with no change round nominee$/, function(name, callback) {
        let nomination = this.returned.election.nominations[0];
        findUser.call(this, name, (error, user) => {
            if(error) {
                return callback(error);
            }
            assertEquals("nominee", nomination.nominee, user.userId, (error) => {
                if(error) {
                    return callback(error);
                }
                assertEquals("nominator", nomination.nominator, this.userId, (error) => {
                    if(error) {
                        return callback(error);
                    }
                    assertEquals("change round nominee", nomination.changeRoundNominee, null, callback);
                });
            });
        });
    });

    Given(/^I have moved the election to the change round$/, function(callback) {
        updateElection.call(this, { state: "secondRound" }, callback);
    });

    When(/^I update my nomination with nominee "([^"]+)"$/, function(name, callback) {
        updateNominationByName.call(this, name, "nominee", callback);
    });

    When(/^I update my nomination with change round nominee "([^"]+)"$/, function(name, callback) {
        updateNominationByName.call(this, name, "changeRoundNominee", callback);
    });

    Given(/^I have updated my nomination with change round nominee "([^"]+)"$/, function(name, callback) {
        updateNominationByName.call(this, name, "changeRoundNominee", callback);
    });

    function updateNominationByName(name, fieldName, callback) {
        findUser.call(this, name, (error, user) => {
            if(error) {
                return callback(error);
            }
            updateNomination.call(this, { [fieldName]: user.userId }, callback);
        });
    }

    function updateNomination(data, callback) {
        request.put({
            url: `${this.url}/circles/${this.circle.circleId}/roles/${this.role.roleId}/elections/nominations`,
            auth: {
                user: this.userId,
                pass: this.token
            },
            body: data,
            json: true
        }, (error, response, body) => {
            this.error = error;
            this.response = response;
            this.body = body;

            callback();
        });
    }

    Then(/^the change round nominee of the returned nomination should be "([^"]+)"$/, function(name, callback) {
        findUser.call(this, name, (error, user) => {
            if(error) {
                return callback(error);
            }
            assertEquals("change round nominee", this.returned.nomination.changeRoundNominee, user.userId, callback);
        });
    });

    Given(/^I have made a change round nomination for "([^"]+)"$/, function(name, callback) {
        makeChangeRoundNominationByName.call(this, name, callback);
    });

    When(/^I complete the election with "([^"]+)" as electee and the following data:$/, function(name, table, callback) {
        findUser.call(this, name, (error, user) => {
            if(error) {
                return callback(error);
            }
            let data = table.rowsHash();
            data.electee = user.userId;
            data.state = "completed";
            updateElection.call(this, data, callback);
        });
    });

    Then(/^the returned election should have "([^"]+)" as electee$/, function(name, callback) {
        findUser.call(this, name, (error, user) => {
            if(error) {
                return callback(error);
            }
            assertEquals("electee", this.returned.election.electee, user.userId, callback);
        });
    });

    Then(/^the returned election should contain a nomination of "([^"]+)" by me and with "([^"]+)" as change round nominee$/, function(name1, name2, callback) {
        findUser.call(this, name1, (error, user1) => {
            if(error) {
                return callback(error);
            }
            findUser.call(this, name2, (error, user2) => {
                if(error) {
                    return callback(error);
                }
                let nomination = this.returned.election.nominations.find((nomination) => nomination.nominator == this.userId);
                if(!nomination) {
                    return callback("No nomination by me in nominations: " + JSON.stringify(this.returned.election.nominations));
                }
                assertEquals("nominee", nomination.nominee, user1.userId, (error) => {
                    if(error) {
                        return callback(error);
                    }
                    assertEquals("change round nominee", nomination.changeRoundNominee, user2.userId, callback);
                });
            });
        });
    });

    Given(/^I have completed the election with "([^"]+)" as electee and the following data:$/, function(name, table, callback) {
        findUser.call(this, name, (error, user) => {
            if(error) {
                return callback(error);
            }
            let data = table.rowsHash();
            data.state = "completed";
            data.electee = user.userId;
            updateElection.call(this, data, callback);
        });
    });

    Then(/^the returned role should contain an election$/, function(callback) {
        this.contained = { election: this.returned.role.elections[0] };
        assertEquals("number of elections", this.returned.role.elections.length, 1, callback);
    });

    Then(/^the contained election should have the following data:$/, function(table, callback) {
        ensureObjectMatch.call(this, "contained.election", this.contained.election, table.rowsHash(), callback);
    });

    Then(/^the term of the contained election should (start|end) on ([0-9\-]+)$/, function(key, date, callback) {
        assertEquals(`term ${key}`, this.contained.election.term[key], date, callback);
    });

    Then(/^the contained election should have "([^"]+)" as electee$/, function(name, callback) {
        findUser.call(this, name, (error, user) => {
            if(error) {
                return callback(error);
            }
            assertEquals("electee", this.contained.election.electee, user.userId, callback);
        });
    });

    Then(/^the contained election should contain a nomination of "([^"]+)" by me and with "([^"]+)" as change round nominee$/, function(name1, name2, callback) {
        findUser.call(this, name1, (error, user1) => {
            if(error) {
                return callback(error);
            }
            findUser.call(this, name2, (error, user2) => {
                if(error) {
                    return callback(error);
                }
                let nomination = this.contained.election.nominations.find((nomination) => nomination.nominator == this.userId);
                if(!nomination) {
                    return callback("No nomination by me in nominations: " + JSON.stringify(this.returned.election.nominations));
                }
                assertEquals("nominee", nomination.nominee, user1.userId, (error) => {
                    if(error) {
                        return callback(error);
                    }
                    assertEquals("change round nominee", nomination.changeRoundNominee, user2.userId, callback);
                });
            });
        });
    });

    Then(/^the (returned|contained) election should have today's date as its completion date$/, function(containmentType, callback) {
        assertEquals("completion date", this[containmentType].election.completedAt.substring(0,10), (new Date()).toISOString().substring(0, 10), callback);
    });

    Then(/^the (returned|contained) election should have a fully qualified datetime as its completion date$/, function(containmentType, callback) {
        if(!/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]+(\.[0-9]+)?Z$/.test(this[containmentType].election.completedAt)) {
            return callback(new Error(`Completion date (${this[containmentType].election.completedAt}) does not match expected pattern`));
        }
        callback();
    });
});
