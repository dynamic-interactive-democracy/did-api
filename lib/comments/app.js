const express = require("express");
const create = require("./create");
const get = require("./get");
const getAll = require("./getAll");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const commentsSql = fs.readFileSync(path.join(__dirname, "../../data/sql/comments.sql"), "utf8");

module.exports = (log, pgdb, commentDomain) => {
    // setting a timeout here because commentsSql uses pgcrypto, and we get a
    // conflict if we try to create pgcrypto too soon after its been made in
    // circlesSql
    setTimeout(() => {
        pgdb.query(commentsSql, (error) => {
            if(error) {
                log.error({ error }, "Could not assert circle table");
                throw error;
            }
        });
    }, 100);

    let app = express();

    app.use((req, res, next) => {
        req.pgdb = pgdb;
        next();
    });

    app.use((req, res, next) => {
        req.commentDomain = commentDomain;
        next();
    });

    app.post("/", bodyParser.json(), create);
    app.get("/:commentId", get);
    app.get("/", getAll);

    return app;
};