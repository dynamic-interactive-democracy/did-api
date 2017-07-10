module.exports = function(req, res) {
    req.pgdb.query("SELECT id, data FROM topics WHERE id = $1", [`${req.circle.circleId}-${req.params.topicName}`], (error, result) => {
        if(error) {
            req.log.error({ error }, "Error while gettings topic");
            return res.sendStatus(500);
        }

        if(!result.rows.length) {
            return res.status(404).send({
                status: "Topic does not exist"
            });
        }

        const topic = result.rows[0].data;

        res.send({ topic });
    });
};
