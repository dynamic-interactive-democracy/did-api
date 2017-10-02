const _ = require("lodash");

module.exports = function(req, res) {

    req.pgdb.query("SELECT * FROM comments WHERE domain = $1 AND subject = $2", [req.commentDomain, req.commentSubject], (error, result) => {
        if(error) {
            req.log.error({ error }, "Error while getting comments");
            return res.sendStatus(500);
        }

        if(!result.rows.length) return res.send([]);

        const comments = _.map(result.rows, (row) => {
            row.data.commentId = row.id;
            return row.data;
        });

        res.send({ comments });
    });
};
