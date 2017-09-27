const _ = require("lodash");

module.exports = function(req, res, next) {
    req.pgdb.query("SELECT id, data FROM circles WHERE id = $1", [req.params.circleId], (error, result) => {
        if(error) {
            req.log.error({ error }, "Error while gettings circle");
            return res.sendStatus(500);
        }

        if(!result.rowCount) {
            return res.status(404).send({
                status: "Circle does not exist"
            });
        }

        req.circle = result.rows[0].data;
        req.circle.circleId = result.rows[0].id;

        req.log.info({ circle: _.pick(req.circle, ["name"]) }, "Fetched circle");

        next();
    });
};
