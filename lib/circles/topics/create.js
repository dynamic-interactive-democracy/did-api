const stageEnum = require("./stageEnum.json");

module.exports = function(req, res) {
    const topicId = req.body.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
    const canonicalTopicId = `${req.circle.circleId}/${topicId}`;

    const topic = {
        topicId,
        canonicalTopicId,
        title: req.body.title,
        owner: req.user.userId,
        why: req.body.why || "",
        stage: "exploration",
        presentAtDecisionMaking: [],
        attachments: [],
        comments: [],
        finalProposals: []
    };

    if(!topic.title) return res.status(400).send({ status: "Topic title is missing" });
    if(!stageEnum.includes(topic.stage)) return res.status(400).send({ status: `stage can only be the following values: ${JSON.stringify(stageEnum)}` });

    req.pgdb.query("INSERT INTO topics VALUES($1::text, $2::json) RETURNING data", [canonicalTopicId, topic], (error, result) => {
        if(error) {
            req.log.error({ error }, "Error while creating topic");
            return res.sendStatus(500);
        }

        const topic = result.rows[0].data;

        res.status(201).send({ status: "Topic created", topic });
    });
};
