const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const usersSql = fs.readFileSync("./data/sql/circles.sql").toString();

const authenticate = require("../authenticate");

const create = require("./create");
const getAll = require("./getAll");
const get = require("./get");

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

    app.post("/", authenticate, bodyParser.json(), create);
    app.get("/", authenticate, getAll);
    app.get("/:id", authenticate, get);

    return app;
};
