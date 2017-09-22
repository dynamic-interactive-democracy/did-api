module.exports = function(req, res) {
    deleteById(req.pgdb, "roles", `${req.circle.circleId}/${req.params.roleId}`, (error) => {
        if(error && error.type == "NotFound") {
            return res.status(404).send({
                status: "Task does not exist"
            });
        }
        if(error) {
            req.log.error({ error }, "Error while deleting task");
            return res.sendStatus(500);
        }

        res.sendStatus(204);
    });
};

function deleteById(pgdb, table, id, callback) {
    pgdb.query(`DELETE FROM ${table} WHERE id = $1`, [id], (error, result) => {
        if(error) {
            return callback(error);
        }

        if(!result.rowCount) {
            return callback({
                type: "NotFound",
                trace: new Error("Failed to delete entry by id")
            });
        }

        callback();
    });
}
