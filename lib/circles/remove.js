module.exports = function(req, res) {
    req.pgdb.query("DELETE FROM circles WHERE id = $1", [req.params.id], (error, result) => {
        if(error) {
            req.log.error({ error }, "Error while deleting circle");
            return res.sendStatus(500);
        }

        if(!result.rowCount) {
            return res.status(404).send({
                status: "Circle does not exist"
            });
        }

        res.sendStatus(204);
    });
};
