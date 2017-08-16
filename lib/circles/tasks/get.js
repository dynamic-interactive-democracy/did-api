module.exports = function(req, res) {
    req.pgdb.query("SELECT id, data FROM tasks WHERE id = $1", [`${req.circle.circleId}/${req.params.taskId}`], (error, result) => {
        if(error) {
            req.log.error({ error }, "Error while gettings task");
            return res.sendStatus(500);
        }

        if(!result.rows.length) {
            return res.status(404).send({
                status: "Task does not exist"
            });
        }

        const task = result.rows[0].data;

        res.send({ task });
    });
};
