const express = require("express");
const bodyParser = require("body-parser");

const authenticate = require("../../authenticate");

const invite = require("./invite");
const accept = require("./accept");
const remove = require("./remove");

module.exports = (log, pgdb) => {
    let app = express();

    app.use((req, res, next) => {
        req.pgdb = pgdb;
        next();
    });

    const jsonBodyParser = bodyParser.json();

    app.post("/", authenticate, jsonBodyParser, invite);
    app.post("/accept", authenticate, accept);
    app.delete("/:userId", authenticate, jsonBodyParser, remove);

    return app;
};
