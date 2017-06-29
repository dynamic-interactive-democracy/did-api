module.exports = function(req, res) {
    // TODO assert that userId exists
    // TODO assert that authenticated user can invite member
    // TODO assert that userId is not already invited
    // TODO assert that userId is not already a member

    req.circle.invited.push(req.body.userId);

    req.pgdb.query("UPDATE circles SET data=$1 WHERE id=$2 RETURNING id, data", [req.circle, req.circle.id], (error) => {
        if(error) {
            req.log.error({ error }, "Error while inviting member to circle");
            return res.sendStatus(500);
        }

        res.sendStatus(204);
    });
};
