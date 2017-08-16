module.exports = function(req, res) {
    req.pgdb.query("DELETE FROM tasks WHERE id = $1", [`${req.circle.circleId}/${req.params.taskId}`], (error, result) => {
        if(error) {
            req.log.error({ error }, "Error while deleting task");
            return res.sendStatus(500);
        }

        if(!result.rowCount) {
            return res.status(404).send({
                status: "Task does not exist"
            });
        }

        res.sendStatus(204);
    });
};
