module.exports = function(req, res) {
    req.pgdb.query("SELECT * FROM comments WHERE domain = $1 AND subject = $2 AND id = $3", [req.commentDomain, req.commentSubject, req.params.commentId], (error, result) => {
        if(error) {
            req.log.error({ error }, "Error while getting comment");
            return res.sendStatus(500);
        }

        if(!result.rows.length) {
            return res.status(404).send({
                status: "Comment does not exist"
            });
        }

        const comment = result.rows[0].data;
        comment.commentId = result.rows[0].id;

        res.send({ comment });
    });
};
