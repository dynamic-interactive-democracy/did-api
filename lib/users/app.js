const express = require("express");
const create = require("./create");
const get = require("./get");
const bodyParser = require("body-parser");
const fs = require("fs");
const usersSql = fs.readFileSync("./data/sql/users.sql").toString();

module.exports = (log, pgdb) => {
    pgdb.query(usersSql, (error) => {
        if(error) {
            log.error({ error }, "Could not assert user table");
            throw error;
        }
    });

    let app = express();

    app.use((req, res, next) => {
        req.pgdb = pgdb;
        next();
    });

    app.post("/", bodyParser.json(), create);
    app.get("/", get);

    return app;
};
