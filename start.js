const package = require("./package");
const config = require("config");
const bunyan = require("bunyan");
const express = require("express");
const Pool = require("pg-pool");

const canary = require("./lib/canary");
const user = require("./lib/user/app");
const users = require("./lib/users/app");

let log = bunyan.createLogger({ name: package.name });
let pgdb = new Pool(config.postgres);
let app = express();

app.use((req, res, next) => {
    req.log = log;
    next();
});

app.use("/canary", canary(pgdb));
app.use("/user", user(log, pgdb));
app.use("/users", users(log, pgdb));

app.listen(3000);
