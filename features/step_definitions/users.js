/* eslint new-cap: 0 */

const cucumber = require("cucumber");
const assert = require("assert");
const uuid = require("uuid");
const request = require("request");

cucumber.defineSupportCode(function({ Given, When, Then }) {
    Given(/^I have a users name$/, function(callback) {
        this.userName = "Donald Duck";

        callback();
    });

    Given(/^I have a users id$/, function(callback) {
        this.userId = uuid.v4();

        callback();
    });

    Given(/^I have a users token$/, function(callback) {
        this.userName = "Donald Duck";
        this.userId = uuid.v4();

        request.post({
            url: `${this.url}/users`,
            body: {
                name: this.userName,
                userId: this.userId
            },
            json: true
        }, (error, response, body) => {
            if(error) return callback(error);

            if(response.statusCode !== 201) throw new Error(`HTTP code was ${response.statusCode} but expected 201: ${JSON.stringify(body)}`);

            this.token = body.user.token;

            callback();
        });
    });

    When(/^I create a user$/, function(callback) {
        request.post({
            url: `${this.url}/users`,
            body: {
                name: this.userName,
                userId: this.userId
            },
            json: true
        }, (error, response, body) => {
            this.error = error;
            this.response = response;
            this.body = body;

            callback();
        });
    });

    Then(/^I receive a user object$/, function(callback) {
        if(this.error) return callback(this.error);

        assert.equal(this.response.statusCode, 201);
        assert.equal(this.body.user.token.length, 128);
        assert.equal(this.body.user.name, this.userName);

        callback();
    });
});
