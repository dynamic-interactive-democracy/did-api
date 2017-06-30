const cucumber = require("cucumber");
const log = console;

const DidApp = require("../../index");
const config = require("config");

cucumber.defineSupportCode(function({ registerHandler }) {
    registerHandler("BeforeFeatures", function(features, callback) {
        log.info("Setting up docker containers"); //TODO
        callback();
    });

    registerHandler("BeforeScenario", function(features, callback) {
        log.info("Resetting databases"); //TODO

        log.info("Starting server");
        this.didApp = new DidApp(console, config);
        this.didApp.start(callback);
    });
});
