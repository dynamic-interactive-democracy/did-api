module.exports = function(req, res) {
    req.pgdb.query("SELECT id, data FROM circles WHERE id = $1", [req.params.id], (error, result) => {
        if(error) {
            req.log.error({ error }, "Error while gettings circle");
            return res.sendStatus(500);
        }

        if(!result.rows.length) {
            return res.status(404).send({
                status: "Circle does not exist"
            });
        }

        const circle = result.rows[0].data;
        circle.id = result.rows[0].id;

        res.send({ circle });
    });
};
