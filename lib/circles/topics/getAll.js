const _ = require("lodash");

module.exports = function(req, res) {
    req.pgdb.query("SELECT id, data FROM topics WHERE id LIKE $1", [`${req.circle.circleId}/%`], (error, result) => {
        if(error) {
            req.log.error({ error }, "Error while gettings topics");
            return res.sendStatus(500);
        }

        const topics = _.map(result.rows, "data");

        res.send({ topics });
    });
};
