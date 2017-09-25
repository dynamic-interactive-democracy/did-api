const statusEnum = require("./statusEnum.json");

module.exports = function(req, res) {
    const taskId = req.body.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
    const canonicalTaskId = `${req.circle.circleId}/${taskId}`;

    let task = {
        taskId,
        canonicalTaskId,
        title: req.body.title,
        owner: req.user.userId,
        description: req.body.description || "",
        aim: req.body.aim || "",
        dueDate: req.body.dueDate || null, //TODO: validate date format
        status: req.body.status || "onSchedule",
        attachments: []
    };

    if(!task.title) return res.status(400).send({ status: "Task title is missing" });
    if(!statusEnum.includes(task.status)) return res.status(400).send({ status: `stage can only be the following values: ${JSON.stringify(statusEnum)}` });

    insertTaskOrRetryWithNewTaskId(req, task, (error, result) => {
        if(error) {
            req.log.error({ error }, "Error while creating task");
            return res.sendStatus(500);
        }

        const task = result.rows[0].data;

        res.status(201).send({ status: "Task created", task });
    });
};

function insertTaskOrRetryWithNewTaskId(req, task, callback) {
    insertTask(req, task, (error, result) => {
        if(error && error.constraint == "tasks_pkey") {
            return req.pgdb.query("SELECT id FROM tasks WHERE id LIKE $1", [`${task.canonicalTaskId}%`], (error, result) => {
                if(error) {
                    req.log.error({ error }, "Failed to get existing task IDs similar to the natural one for the new task");
                    return res.sendStatus(500);
                }
                let existingCanonicalIds = result.rows.map(row => row.id);
                let newTaskId = determineNewTaskId(existingCanonicalIds, req.circle.circleId, task.taskId);
                task.taskId = newTaskId;
                task.canonicalTaskId = `${req.circle.circleId}/${newTaskId}`;
                insertTaskOrRetryWithNewTaskId(req, task, callback);
            });
        }
        callback(error, result);
    });
}

function insertTask(req, task, callback) {
    req.pgdb.query("INSERT INTO tasks VALUES($1::text, $2::json) RETURNING data", [task.canonicalTaskId, task], callback);
}

function determineNewTaskId(existingCanonicalIds, circleId, taskId) {
    let suffixes = existingCanonicalIds.map(canonicalId => {
        if(canonicalId.length > circleId.length + taskId.length + 1) {
            return canonicalId.substring(circleId.length + taskId.length + 1);
        }
        return "";
    }).filter(suf => suf != "");
    let numericalSuffixes = suffixes.map(suf => {
        let match = suf.match(/^\-([0-9]+)$/);
        if(!match) return null;
        return parseInt(match[1]);
    });
    let sortedNumericalSuffixes = numericalSuffixes.sort((a,b) => {
        if(a < b) return -1;
        if(a == b) return 0;
        return 1;
    });
    if(sortedNumericalSuffixes.length) {
        let lastNumericalSuffix = sortedNumericalSuffixes[sortedNumericalSuffixes.length - 1];
        return taskId + "-" + (lastNumericalSuffix + 1);
    }
    return taskId + "-1";
}
