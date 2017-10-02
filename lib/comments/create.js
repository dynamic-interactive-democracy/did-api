module.exports = function(req, res) {
    const comment = {
        author: req.user.userId,
        comment: req.body.comment,
        createdAt: (new Date()).toISOString()
    };

    const domain = req.commentDomain;
    const subject = req.commentSubject;
    const bucket = req.circle.circleId;

    req.pgdb.query("INSERT INTO comments (subject, domain, bucket, data) VALUES($1, $2, $3, $4::json) RETURNING id, data", [subject, domain, bucket, comment], (error, result) => {
        if(error) {
            req.log.error({ error }, "Error while creating comment");
            return res.sendStatus(500);
        }

        const comment = result.rows[0].data;
        comment.commentId = result.rows[0].id;

        res.status(201).send({ status: "Comment created", comment });
    });

    res.status(504);
};
