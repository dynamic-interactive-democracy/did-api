/* eslint new-cap: 0 */

const cucumber = require("cucumber");
const assert = require("assert");
const request = require("request");

cucumber.defineSupportCode(function({ Given, When, Then }) {
    Given(/^I want to create a circle$/, function(callback) {
        this.circle = { };
        callback();
    });

    Given(/^I want the (\w*) of the circle to be "(.*)"$/, function(field, value, callback) {
        this.circle[field] = value;
        callback();
    });

    Given(/^a circle, "([^"]+)"(, to which I belong)?$/, function(circleName, belongingToCircle, callback) {
        if(belongingToCircle) {
            return createCircle.call(this, circleName, callback);
        }
        else {
            throw new Error("Not supported: creating circle to which I do not belong.");
        }
    });

    function createCircle(circleName, callback) {
        request.post({
            url: `${this.url}/circles`,
            body: { name: circleName },
            json: true,
            auth: {
                user: this.userId,
                pass: this.token
            }
        }, (error, response, body) => {
            if(error) return callback(error);

            if(response.statusCode !== 201) throw new Error(`HTTP code was ${response.statusCode} but expected 201: ${JSON.stringify(body)}`);
            this.circle = body.circle;

            callback();
        });
    }

    Given(/^I have a circle called "(.*)"$/, function(circleName, callback) {
        createCircle.call(this, circleName, callback);
    });

    When(/^I create the circle$/, function(callback) {
        request.post({
            url: `${this.url}/circles`,
            body: this.circle,
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

    Then(/^I receive a circle object$/, function(callback) {
        if(this.error) return callback(this.error);

        const circle = this.body.circle;
        if(!circle.circleId) return callback("No circle id");
        if(!circle.name) return callback("No circle name");

        callback();
    });

    Then(/^the (\w*) of the circle is "(.*)"$/, function(field, value, callback) {
        assert.equal(this.body.circle[field], value);
        callback();
    });
});
