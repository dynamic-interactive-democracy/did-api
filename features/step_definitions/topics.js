/* eslint new-cap: 0 */

const cucumber = require("cucumber");
const assert = require("assert");
const request = require("request");
const _ = require("lodash");

cucumber.defineSupportCode(function({ Given, When, Then }) {
    Given(/^I want to create a topic$/, function(callback) {
        this.topic = { };
        callback();
    });

    Given(/^I want to update a topic$/, function(callback) {
        this.topic = { };
        callback();
    });

    Given(/^I want the (\w*) of the topic to be "(.*)"$/, function(field, value, callback) {
        this.topic[field] = value;
        callback();
    });

    Given(/^I have a topic called "(.*)"$/, function(title, callback) {
        request.post({
            url: `${this.url}/circles/${this.circle.circleId}/topics`,
            body: { title },
            json: true,
            auth: {
                user: this.userId,
                pass: this.token
            }
        }, (error, response, body) => {
            if(error) return callback(error);

            if(response.statusCode !== 201) throw new Error(`HTTP code was ${response.statusCode} but expected 201: ${JSON.stringify(body)}`);
            this.topic = body.topic;

            callback();
        });
    });

    When(/^I create the topic$/, function(callback) {
        request.post({
            url: `${this.url}/circles/${this.circle.circleId}/topics`,
            body: this.topic,
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

    When(/^I request the topic called "(.*)"$/, function(title, callback) {
        const topicId = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");

        request.get({
            url: `${this.url}/circles/${this.circle.circleId}/topics/${topicId}`,
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

    When(/^I request the topic list$/, function(callback) {
        request.get({
            url: `${this.url}/circles/${this.circle.circleId}/topics`,
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

    When(/^I delete the topic called "(.*)"$/, function(title, callback) {
        const topicId = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");

        request.delete({
            url: `${this.url}/circles/${this.circle.circleId}/topics/${topicId}`,
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

    When(/^I update the topic called "(.*)"$/, function(title, callback) {
        const topicId = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");

        request.put({
            url: `${this.url}/circles/${this.circle.circleId}/topics/${topicId}`,
            body: this.topic,
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

    Then(/^I receive a topic object$/, function(callback) {
        if(this.error) return callback(this.error);

        const topic = this.body.topic;
        assert.ok(topic.title);

        callback();
    });

    Then(/^I receive a list of topics$/, function(callback) {
        if(this.error) return callback(this.error);

        const topics = this.body.topics;
        topics.forEach((topic) => {
            assert.ok(topic.title);
        });

        callback();
    });

    Then(/^one topic called "(.*)"$/, function(title, callback) {
        if(this.error) return callback(this.error);

        const topics = this.body.topics;
        assert.ok(_.some(topics, { title }));

        callback();
    });

    Then(/^the (\w*) of the topic is "(.*)"$/, function(field, value, callback) {
        assert.equal(this.body.topic[field], value);
        callback();
    });
});
