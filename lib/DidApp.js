const express = require("express");
const Pool = require("pg-pool");
const path = require("path");

const canary = require("./canary");
const user = require("./user/app");
const users = require("./users/app");
const circles = require("./circles/app");

let DidApp = module.exports = function(log, config) {
    this.config = config;

    let pgdb = new Pool(config.postgres);
    let app = express();

    app.use((req, res, next) => {
        req.log = log;
        next();
    });

    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Authorization");
        next();
    });

    app.use("/canary", canary(pgdb));
    app.use("/user", user(log, pgdb));
    app.use("/users", users(log, pgdb));
    app.use("/circles", circles(log, pgdb));
    app.use("/integrate", express.static(path.join(__dirname, "integrate")));

    this.pgdb = pgdb;
    this.app = app;
};


DidApp.prototype.start = function(callback) {
    this.server = this.app.listen(this.config.port, callback);
};

DidApp.prototype.stop = function(callback) {
    this.pgdb.end((error) => {
        if(error) return callback(error);
        this.server.close(callback);
    });
};
