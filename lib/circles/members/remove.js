const _ = require("lodash");

module.exports = function(req, res) {
    // TODO assert that userId is member of circle
    // TODO assert that authenticated user can only remove themself if they are not a member of the circle
    // TODO assert that authenticated user is a member of the circle, if removing someone else

    _.pull(req.circle.members, req.params.userId);
    _.pull(req.circle.invited, req.params.userId);
    if(req.circle.contactPerson === req.params.userId) req.circle.contactPerson = null;

    req.pgdb.query("UPDATE circles SET data=$1 WHERE id=$2 RETURNING id, data", [req.circle, req.circle.id], (error) => {
        if(error) {
            req.log.error({ error }, "Error while removing member from circle");
            return res.sendStatus(500);
        }

        res.sendStatus(204);
    });
};
