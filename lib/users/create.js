const async = require("async");
const _ = require("lodash");
const crypto = require("crypto");

module.exports = function(req, res) {
    if(!(req.body instanceof Array)) req.body = [req.body];

    async.map(req.body, async.reflect((body, callback) => createUser(req.pgdb, body.userId, body.name, callback)), (error, users) => {
        if(_.find(users, "error")) {
            req.log.error({ users }, "Error while creating user");
            return res.sendStatus(500);
        }

        if(users.length === 1) return res.status(201).send({ status: "User created", user: users[0].value });
        res.send({ status: "Users created", users: _.map(users, "value") });
    });
};

function createUser(pgdb, userId, name, callback) {
    crypto.randomBytes(64, function(err, buffer) {
        const token = buffer.toString("hex");
        const data = { name, userId };

        pgdb.query("INSERT INTO users VALUES($1::text, $2::json) RETURNING token, data", [token, data], (error, result) => {
            if(error) return callback(error);

            const user = {
                token: result.rows[0].token,
                name: result.rows[0].data.name,
                userId: result.rows[0].data.userId
            };

            callback(null, user);
        });
    });
}
