const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const topicsSql = fs.readFileSync("./data/sql/topics.sql", "utf8");

const authenticate = require("../../authenticate");

const create = require("./create");
const get = require("./get");
const getAll = require("./getAll");
const update = require("./update");
const remove = require("./remove");

module.exports = (log, pgdb) => {
    pgdb.query(topicsSql, (error) => {
        if(error) {
            log.error({ error }, "Could not assert topics table");
            throw error;
        }
    });

    let app = express();

    app.use((req, res, next) => {
        req.pgdb = pgdb;
        next();
    });

    const jsonBodyParser = bodyParser.json();

    // TODO Do we need to only let users in circle perform CRUD on topics in said circle?

    app.post("/", authenticate, jsonBodyParser, create);
    app.get("/:topicName", authenticate, get);
    app.get("/", authenticate, getAll);
    app.put("/:topicName", authenticate, jsonBodyParser, update);
    app.delete("/:topicName", authenticate, jsonBodyParser, remove);

    return app;
};
