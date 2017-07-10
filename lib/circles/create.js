const procedureDefaults = require("./procedureDefaults/index");
const fullStateEnum = require("./fullStateEnum");

module.exports = function(req, res) {
    const circle = {
        name: req.body.name || null,
        vision: req.body.vision || "",
        mission: req.body.mission || "",
        aim: req.body.aim || "",
        expectationsForMembers: req.body.expectationsForMembers || "",
        members: [req.user.userId],
        invited: req.body.invited || [],
        contactPerson: req.user.userId,
        fullState: req.body.fullState || "lookingForMore",
        roleElectionProcedure: procedureDefaults.role.election,
        roleEvaluationProcedure: procedureDefaults.role.evaluation,
        taskMeetingProcedure: procedureDefaults.task,
        topicExplorationStageProcedure: procedureDefaults.topic.exploration,
        topicPictureFormingStageProcedure: procedureDefaults.topic.pictureForming,
        topicProposalShapingStageProcedure: procedureDefaults.topic.proposalShaping,
        topicDecisionMakingStageProcedure: procedureDefaults.topic.decisionMaking,
        topicAgreementStageProcedure: procedureDefaults.topic.agreement,
        agreementEvaluationProcedure: procedureDefaults.agreementEvaluation
    };

    if(!circle.name) return res.status(400).send({ status: "Circle name is missing" });
    if(!(circle.invited instanceof Array)) return res.status(400).send({ status: "invited must be a list of userIds" });
    if(circle.fullState && !fullStateEnum.includes(circle.fullState)) return res.status(400).send({ status: `fullState can only be the following values: ${JSON.stringify(fullStateEnum)}` });

    //TODO assert that req.body.invited are in fact known userIds

    req.pgdb.query("INSERT INTO circles VALUES($1::json) RETURNING id, data", [circle], (error, result) => {
        if(error && error.constraint === "circle_data_name_idx") {
            req.log.warn("Attemped to create circle with pre-existing name");
            return res.status(400).send({ status: "Circle name already exists" });
        }
        if(error) {
            req.log.error({ error }, "Error while creating circle");
            return res.sendStatus(500);
        }

        const circle = result.rows[0].data;
        circle.circleId = result.rows[0].id;

        res.status(201).send({ status: "Circle created", circle });
    });
};
