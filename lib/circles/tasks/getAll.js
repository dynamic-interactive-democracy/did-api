const _ = require("lodash");

module.exports = function(req, res) {
    req.pgdb.query("SELECT id, data FROM tasks WHERE id LIKE $1", [`${req.circle.circleId}/%`], (error, result) => {
        if(error) {
            req.log.error({ error }, "Error while gettings tasks");
            return res.sendStatus(500);
        }

        const tasks = _.map(result.rows, "data");

        res.send({ tasks });
    });
};
