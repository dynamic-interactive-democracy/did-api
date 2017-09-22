const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const usersSql = fs.readFileSync(path.join(__dirname, "../../data/sql/circles.sql"), "utf8");

const authenticate = require("../authenticate");
const getCircleMiddleware = require("./getCircleMiddleware");

const members = require("./members/app");
const topics = require("./topics/app");
const tasks = require("./tasks/app");
const roles = require("./roles/app");

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
    app.get("/:circleId", authenticate, get);
    app.put("/:circleId", authenticate, jsonBodyParser, update);
    app.delete("/:circleId", authenticate, remove);

    app.use("/:circleId/members", getCircleMiddleware, members(log, pgdb));
    app.use("/:circleId/topics", getCircleMiddleware, topics(log, pgdb));
    app.use("/:circleId/tasks", getCircleMiddleware, tasks(log, pgdb));
    app.use("/:circleId/roles", getCircleMiddleware, roles(log, pgdb));

    return app;
};
