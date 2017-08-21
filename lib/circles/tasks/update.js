const _ = require("lodash");
const statusEnum = require("./statusEnum.json");

module.exports = function(req, res) {

    const taskParams = {
        title: req.body.title,
        owner: req.body.owner,
        description: req.body.description,
        aim: req.body.aim,
        dueDate: req.body.dueDate, //TODO: validate due date
        status: req.body.status,
    };

    const cleanTaskParams = _.omitBy(taskParams, _.isUndefined);

    // TODO assert that owner exists

    if(_.isEmpty(cleanTaskParams)) {
        req.log.warn("Request contained no values to update task with");
        return res.status(400).send({ status: "There are no values in request" });
    }

    if(cleanTaskParams.status && !statusEnum.includes(cleanTaskParams.status)) {
        req.log.warn("Tried to update task with invalid status");
        return res.status(400).send({ status: `status can only be the following values: ${JSON.stringify(statusEnum)}` });
    }

    req.pgdb.query("SELECT data FROM tasks WHERE id=$1", [`${req.circle.circleId}/${req.params.taskId}`], (error, result) => {
        if(!result.rowCount) {
            return res.status(404).send({
                status: "Task does not exist"
            });
        }

        const updatedTask = _.merge(result.rows[0].data, cleanTaskParams);

        req.pgdb.query("UPDATE tasks SET data=$1 WHERE id=$2 RETURNING id, data", [updatedTask, updatedTask.canonicalTaskId], (error, result) => {
            if(error) {
                req.log.error({ error }, "Error while updating task");
                return res.sendStatus(500);
            }

            const task = result.rows[0].data;

            res.status(200).send({ status: "Task updated", task });
        });
    });
};
