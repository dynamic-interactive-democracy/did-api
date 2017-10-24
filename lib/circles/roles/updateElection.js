const _ = require("lodash");
const getRole = require("./getRole");
const updateRoleEntry = require("./updateRoleEntry");
const addRoleShortcuts = require("./addRoleShortcuts");

module.exports = function(req, res) {
    const cleanElectionParams = cleanParams(req.body, [ "state", "summary", "electee" ]);

    if(!cleanElectionParams.state) {
        req.log.warn("Request contained no values to update election with");
        return res.status(400).send({ status: "There are no values in request" });
    }

    if(![ "firstRound", "secondRound", "completed" ].includes(cleanElectionParams.state)) {
        req.log.warn("Request to change election into invalid state " + cleanElectionParams.state);
        return res.status(400).send({ status: `State ${cleanElectionParams.state} is invalid, must be firstRound|secondRound|completed.` });
    }

    //TODO: Ensure can't go back in states
    //TODO: Ensure summary and electee only allowed with setting of "completed".
    //TODO:                    Summary can be updated after, but electee cannot.

    if(cleanElectionParams.state == "completed") {
        cleanElectionParams.completedAt = (new Date()).toISOString();
    }

    updateElection(req.pgdb, `${req.circle.circleId}/${req.params.roleId}`, cleanElectionParams, (error, election) => {
        if(error && error.type == "NotFound") {
            return res.status(404).send({
                status: "Role does not exist"
            });
        }
        if(error && error.type == "NoOngoingElection") {
            return res.status(403).send({
                status: "No ongoing election to change"
            });
        }
        if(error) {
            req.log.error({ error }, "Error while updating role");
            return res.sendStatus(500);
        }

        res.status(200).send({ status: "Election updated", election });
    });
};

function cleanParams(body, params) {
    let obj = {}
    params.forEach(param => {
        if(body[param]) obj[param] = body[param];
    });
    return obj;
}

function updateElection(pgdb, id, params, callback) {
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

        Object.keys(params).forEach((paramKey) => ongoingElection[paramKey] = params[paramKey]);

        updateRoleEntry(pgdb, role.canonicalRoleId, role, (error, role) => {
            if(error) {
                return callback(error);
            }
            callback(null, ongoingElection);
        });
    });
}
