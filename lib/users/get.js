const async = require("async");
const _ = require("lodash");
const crypto = require("crypto");

module.exports = function(req, res) {
    req.pgdb.query("SELECT * FROM users", (error, result) => {
        if(error) {
            req.log.error({ error }, "Error while getting users");
            return res.sendStatus(500);
        }
        let users = result.rows.map(row => {
            return {
                userId: row.data.userId,
                name: row.data.name
            };
        });
        res.send({ users });
    });
};
