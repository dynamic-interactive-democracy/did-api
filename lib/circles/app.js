const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const usersSql = fs.readFileSync("./data/sql/circles.sql").toString();

const authenticate = require("../authenticate");

const create = require("./create");
const getAll = require("./getAll");
const get = require("./get");
const update = require("./update");
const remove = require("./remove");

module.exports = (log, pgdb) => {
    pgdb.query(usersSql, (error) => {
        if(error) {
            log.error({ error }, "Could not assert circle table");
            throw error;
        }
    });

    let app = express();

    app.use((req, res, next) => {
        req.pgdb = pgdb;
        next();
    });

    const jsonBodyParser = bodyParser.json();

    app.post("/", authenticate, jsonBodyParser, create);
    app.get("/", authenticate, getAll);
    app.get("/:id", authenticate, get);
    app.put("/:id", authenticate, jsonBodyParser, update);
    app.delete("/:id", authenticate, remove);

    return app;
};
