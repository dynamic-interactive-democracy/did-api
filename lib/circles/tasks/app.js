const express = require("express");
const jsonBodyParser = require("body-parser").json();
const fs = require("fs");
const path = require("path");
const tasksSql = fs.readFileSync(path.join(__dirname, "../../../data/sql/tasks.sql"), "utf8");

const authenticate = require("../../authenticate");

const create = require("./create");
const get = require("./get");
const getAll = require("./getAll");
const update = require("./update");
const remove = require("./remove");

module.exports = (log, pgdb) => {
    pgdb.query(tasksSql, (error) => {
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

    // TODO Do we need to only let users in circle perform CRUD on tasks in said circle? Yes

    app.post("/", authenticate, jsonBodyParser, create);
    app.get("/:taskId", authenticate, get);
    app.get("/", authenticate, getAll);
    app.put("/:taskId", authenticate, jsonBodyParser, update);
    app.delete("/:taskId", authenticate, jsonBodyParser, remove);

    return app;
};
