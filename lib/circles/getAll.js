const _ = require("lodash");

module.exports = function(req, res) {
    req.pgdb.query("SELECT id, data FROM circles", (error, result) => {
        if(error) {
            req.log.error({ error }, "Error while gettings circles");
            return res.sendStatus(500);
        }

        const circles = _.map(result.rows, (row) => {
            row.data.id = row.id;
            return row.data;
        });

        res.send({ circles });
    });
};
