const _ = require("lodash");

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
        users = _.uniqBy(users, user => user.userId);
        res.send({ users });
    });
};
