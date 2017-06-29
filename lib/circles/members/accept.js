const _ = require("lodash");

module.exports = function(req, res) {
    // TODO assert that authenticated user is invited

    _.pull(req.circle.invited, req.user.id);
    req.circle.members.push(req.user.id);

    req.pgdb.query("UPDATE circles SET data=$1 WHERE id=$2 RETURNING id, data", [req.circle, req.circle.id], (error) => {
        if(error) {
            req.log.error({ error }, "Error while accepting invitation to circle");
            return res.sendStatus(500);
        }

        res.sendStatus(204);
    });
};
