const _ = require("lodash");
const stageEnum = require("./stageEnum.json");

module.exports = function(req, res) {

    const topicParams = {
        title: req.body.title,
        owner: req.body.userId, //TODO: Shouldn't this get req.body.owner? (Seems odd to call it userId in the request!)
        why: req.body.why,
        stage: req.body.stage,
    };


    const cleanTopicParams = _.omitBy(topicParams, _.isUndefined);


    // TODO assert that userId exists

    if(_.isEmpty(cleanTopicParams)) {
        req.log.warn("Request contained no values to update topic with");
        return res.status(400).send({ status: "There are no values in request" });
    }

    if(cleanTopicParams.stage && !stageEnum.includes(topicParams.stage)) { // TODO: Shouldn't topicParams here be cleanTopicParams?
        req.log.warn("Tried to update topic with invalid stage");
        return res.status(400).send({ status: `stage can only be the following values: ${JSON.stringify(stageEnum)}` });
    }

    req.pgdb.query("SELECT data FROM topics WHERE id=$1", [`${req.circle.circleId}/${req.params.topicId}`], (error, result) => {
        if(!result.rowCount) {
            return res.status(404).send({
                status: "Topic does not exist"
            });
        }

        const updatedTopic = _.merge(result.rows[0].data, cleanTopicParams);

        if(cleanTopicParams.title && cleanTopicParams.title !== updatedTopic.title) return res.status(501).send({ status: "Renaming topics is not supported" });
        //TODO: Is there any reason not to support renaming anymore? As long as the ID stays intact :-)

        req.pgdb.query("UPDATE topics SET data=$1 WHERE id=$2 RETURNING id, data", [updatedTopic, updatedTopic.canonicalTopicId], (error, result) => {
            if(error) {
                req.log.error({ error }, "Error while updating topic");
                return res.sendStatus(500);
            }

            const topic = result.rows[0].data;

            res.status(200).send({ status: "Topic updated", topic });
        });
    });
};
