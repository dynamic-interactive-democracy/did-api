const _ = require("lodash");
const fullStateEnum = require("./fullStateEnum");

module.exports = function(req, res) {

    const circleParams = {
        name: req.body.name,
        vision: req.body.vision,
        mission: req.body.mission,
        aim: req.body.aim,
        contactPerson: req.body.contactPerson,
        fullState: req.body.fullState,
    };

    const cleanCircleParams = _.omitBy(circleParams, _.isUndefined);
    if(_.isEmpty(cleanCircleParams)) {
        req.log.warn("Request contained no values to update circle with");
        return res.status(400).send({ status: "There are no values in request" });
    }

    if(circleParams.fullState && !fullStateEnum.includes(circleParams.fullState)) {
        req.log.warn("Tried to update circle with invalid fullstate");
        return res.status(400).send({ status: `fullState can only be the following values: ${JSON.stringify(fullStateEnum)}` });
    }

    req.pgdb.query("SELECT data FROM circles WHERE id=$1", [req.params.circleId], (error, result) => {
        if(!result.rowCount) {
            return res.status(404).send({
                status: "Circle does not exist"
            });
        }

        const updatedCircle = _.merge(result.rows[0].data, cleanCircleParams);

        req.pgdb.query("UPDATE circles SET data=$1 WHERE id=$2 RETURNING id, data", [updatedCircle, req.params.circleId], (error, result) => {
            if(error) {
                req.log.error({ error }, "Error while updating circle");
                return res.sendStatus(500);
            }

            const circle = result.rows[0].data;
            circle.id = result.rows[0].id;

            res.status(200).send({ status: "Circle updated", circle });
        });
    });
};
