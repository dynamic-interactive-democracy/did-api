const _ = require("lodash");

module.exports = function(req, res) {
    const onlyMemberOf = req.query.onlyMemberOf === "";
    const onlyInvitedTo = req.query.onlyInvitedTo === "";

    if(onlyMemberOf && onlyInvitedTo) return res.status(400).send({ status: "Can't show only member of and only invted to at the same time" });

    let query = "SELECT id, data FROM circles";
    const queryVariables = [];

    if(onlyMemberOf) {
        query = "SELECT id, data FROM circles WHERE (data->'members')::jsonb ? $1";
        queryVariables.push(req.user.userId);
    }

    if(onlyInvitedTo) {
        query = "SELECT id, data FROM circles WHERE (data->'invited')::jsonb ? $1";
        queryVariables.push(req.user.userId);
    }

    req.pgdb.query(query, queryVariables, (error, result) => {
        if(error) {
            req.log.error({ error }, "Error while gettings circles");
            return res.sendStatus(500);
        }

        const circles = _.map(result.rows, (row) => {
            row.data.circleId = row.id;
            return row.data;
        });

        res.send({ circles });
    });
};
