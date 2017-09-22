const _ = require("lodash");

module.exports = function(req, res) {
    getElementsInCircle(req.pgdb, "roles", req.circle.circleId, (error, elements) => {
        if(error) {
            req.log.error({ error }, "Error while gettings roles");
            return res.sendStatus(500);
        }

        const roles = _.map(elements, "data");

        res.send({ roles });
    });
};

function getElementsInCircle(pgdb, table, circleId, callback) {
    pgdb.query(`SELECT id, data FROM ${table} WHERE id LIKE $1`, [`${circleId}/%`], (error, result) => {
        if(error) {
            return callback(error);
        }
        callback(null, result.rows);
    });
}
