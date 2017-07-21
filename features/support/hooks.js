const cucumber = require("cucumber");
const log = require("bunyan").createLogger({ name: "did-api-test", level: "warn" });
const Pool = require("pg-pool");

const DidApp = require("../../index");
const config = require("config");

cucumber.defineSupportCode(function({ registerHandler }) {
    registerHandler("BeforeFeatures", function(features, callback) {
        log.info("Setting up docker containers"); //TODO
        callback();
    });

    registerHandler("BeforeScenario", function(scenario, callback) {
        log.info("Resetting databases"); //TODO

        const pgdb = new Pool(config.postgres);

        pgdb.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;", (error) => {
            if(error) return callback(error);

            scenario.didApp = new DidApp(log, config);
            log.info("Starting server");
            scenario.didApp.start(() => setInterval(callback, 100)); /* TODO annoying delay - i know
                because table creation is done while starting the server
                it could be fixed by emitting an event when all tables are created
            */
        });

    });

    registerHandler("AfterScenario", function(scenario, callback) {
        log.info("Stopping server");

        scenario.didApp.stop(callback);
    });
});
