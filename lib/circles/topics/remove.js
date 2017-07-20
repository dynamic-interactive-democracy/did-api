module.exports = function(req, res) {
    req.pgdb.query("DELETE FROM topics WHERE id = $1", [`${req.circle.circleId}/${req.params.topicName}`], (error, result) => {
        if(error) {
            req.log.error({ error }, "Error while deleting topic");
            return res.sendStatus(500);
        }

        if(!result.rowCount) {
            return res.status(404).send({
                status: "Topic does not exist"
            });
        }

        res.sendStatus(204);
    });
};
