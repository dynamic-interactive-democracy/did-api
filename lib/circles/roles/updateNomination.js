const _ = require("lodash");
const getRole = require("./getRole");
const updateRoleEntry = require("./updateRoleEntry");
const addRoleShortcuts = require("./addRoleShortcuts");

module.exports = function(req, res) {
    const cleanNominationParams = cleanParams(req.body, [ "nominee", "changeRoundNominee" ]);

    if(_.isEmpty(cleanNominationParams)) {
        req.log.warn("Request contained no values to update nomination with");
        return res.status(400).send({ status: "There are no values in request" });
    }

    getElection(req.pgdb, `${req.circle.circleId}/${req.params.roleId}`, (error, election, role) => {
        if(error && error.type == "NoOngoingElection") {
            return res.status(403).send({
                status: "No ongoing election to change"
            });
        }
        if(error) {
            req.log.error({ error }, "Error while updating role");
            return res.sendStatus(500);
        }

        if(cleanNominationParams.nominee && election.state != "firstRound") {
            return res.status(403).send({ status: "You cannot change your nominee in change round, you can only change the change round nominee."});
        }

        if(cleanNominationParams.changeRoundNominee && election.state != "secondRound") {
            return res.status(403).send({ status: "You cannot change your change round nominee in first round, you can only change the nominee."});
        }

        updateNomination(req.pgdb, `${req.circle.circleId}/${req.params.roleId}`, req.user.userId, role, election, cleanNominationParams, (error, nomination) => {
            if(error && error.type == "NotFound") {
                return res.status(404).send({
                    status: "Role does not exist"
                });
            }
            if(error && error.type == "NoPriorNomination") {
                return res.status(403).send({
                    status: "No prior nomination to update"
                });
            }
            if(error) {
                req.log.error({ error }, "Error while updating role");
                return res.sendStatus(500);
            }

            res.status(200).send({ status: "Nomination updated", nomination });
        });
    });
};

function cleanParams(body, params) {
    let obj = {}
    params.forEach(param => {
        if(body[param]) obj[param] = body[param];
    });
    return obj;
}

function getElection(pgdb, id, callback) {
    getRole(pgdb, id, (error, role) => {
        if(error) {
            return callback(error);
        }

        let ongoingElection = role.elections.find((election) => !election.nominee);

        if(!ongoingElection) {
            return callback({
                type: "NoOngoingElection",
                trace: new Error("Could not find an election that has yet to have its nominee determined")
            });
        }

        callback(null, ongoingElection, role);
    });
}

function updateNomination(pgdb, id, userId, role, election, params, callback) {
    let nomination = election.nominations.find((nomination) => nomination.nominator == userId);

    Object.keys(params).forEach((paramKey) => nomination[paramKey] = params[paramKey]);

    updateRoleEntry(pgdb, role.canonicalRoleId, role, (error, role) => {
        if(error) {
            return callback(error);
        }
        callback(null, nomination);
    });
}
