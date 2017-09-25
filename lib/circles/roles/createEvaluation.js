const _ = require("lodash");
const getRole = require("./getRole");
const updateRoleEntry = require("./updateRoleEntry");
const dateMe = require("../../dateMe.js");

module.exports = function(req, res) {
    let evaluation = {
        date: dateMe(),
        content: req.body.content
    };

    if(!evaluation.content || evaluation.content.length == 0) {
        return res.status(400).send({ status: "Missing evaluation content." });
    }

    addRoleEvaluation(req.pgdb, `${req.circle.circleId}/${req.params.roleId}`, evaluation, (error) => {
        if(error && error.type == "NotFound") {
            return res.status(404).send({
                status: "Role does not exist"
            });
        }
        if(error) {
            req.log.error({ error }, "Error while creating evaluation");
            return res.sendStatus(500);
        }

        res.status(201).send({ status: "Evaluation created", evaluation });
    });
};

function addRoleEvaluation(pgdb, id, evaluation, callback) {
    getRole(pgdb, id, (error, role) => {
        if(error) {
            return callback(error);
        }

        role.evaluations.push(evaluation);

        updateRoleEntry(pgdb, role.canonicalRoleId, role, callback);
    });
}
