const express = require("express");
const jsonBodyParser = require("body-parser").json();
const fs = require("fs");
const path = require("path");
const rolesSql = fs.readFileSync(path.join(__dirname, "../../../data/sql/roles.sql"), "utf8");

const authenticate = require("../../authenticate");

const create = require("./create");
const get = require("./get");
const getAll = require("./getAll");
const update = require("./update");
const remove = require("./remove");
const createEvaluation = require("./createEvaluation");
const createElection = require("./createElection");
const updateElection = require("./updateElection");
const createNomination = require("./createNomination");
const updateNomination = require("./updateNomination");

module.exports = (log, pgdb) => {
    pgdb.query(rolesSql, (error) => {
        if(error) {
            log.error({ error }, "Could not assert roles table");
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
    app.get("/:roleId", authenticate, get);
    app.get("/", authenticate, getAll);
    app.put("/:roleId", authenticate, jsonBodyParser, update);
    app.delete("/:roleId", authenticate, jsonBodyParser, remove);

    app.post("/:roleId/evaluations", authenticate, jsonBodyParser, createEvaluation);

    app.post("/:roleId/elections", authenticate, jsonBodyParser, createElection);
    app.put("/:roleId/elections", authenticate, jsonBodyParser, updateElection);

    app.post("/:roleId/elections/nominations", authenticate, jsonBodyParser, createNomination);
    app.put("/:roleId/elections/nominations", authenticate, jsonBodyParser, updateNomination);

    return app;
};
