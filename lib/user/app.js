const express = require("express");

const get = require("./get");

const authenticate = require("./authenticate");

module.exports = (log, pgdb) => {
    let app = express();

    app.use((req, res, next) => {
        req.pgdb = pgdb;
        next();
    });

    app.get("/", authenticate, get);

    return app;
};
