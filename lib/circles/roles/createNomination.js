const _ = require("lodash");
const getRole = require("./getRole");
const updateRoleEntry = require("./updateRoleEntry");
const dateMe = require("../../dateMe.js");

module.exports = function(req, res) {
    let nomination = {
        nominator: req.user.userId,
        nominee: req.body.nominee || null,
        changeRoundNominee: req.body.changeRoundNominee || null
    };

    //TODO: validate nominee or changeRoundNominee
    //TODO: if in wrong round disallow creation!

    let roleId = `${req.circle.circleId}/${req.params.roleId}`;

    getElection(req.pgdb, roleId, (error, election, role) => {
        if(error && error.type == "NotFound") {
            return res.status(404).send({
                status: "Role does not exist"
            });
        }
        if(error && error.type == "NoOngoingElection") {
            return res.status(403).send({
                status: "No ongoing election to make nomination for"
            });
        }
        if(error) {
            req.log.error({ error }, "Error while getting election");
            return res.sendStatus(500);
        }

        if(nomination.nominee && election.state != "firstRound") {
            return res.status(403).send({
                status: "Cannot set nominee when no longer in first round"
            });
        }
        if(nomination.changeRoundNominee && election.state != "secondRound") {
            return res.status(403).send({
                status: "Cannot set change round nominee when not in change round"
            });
        }
        
        addRoleElectionNomination(req.pgdb, roleId, req.user.userId, election, role, nomination, (error) => {
            if(error && error.type == "PriorNominationExists") {
                return res.status(403).send({
                    status: "Could not create a nomination as one already exists. Update it instead."
                });
            }
            if(error) {
                req.log.error({ error }, "Error while creating nomination");
                return res.sendStatus(500);
            }

            res.status(201).send({ status: "Nomination created", nomination });
        });
    });
};

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

function addRoleElectionNomination(pgdb, id, userId, ongoingElection, role, nomination, callback) {
    let nominationByCurrentUser = ongoingElection.nominations.find((nomination) => nomination.nominator == userId);

    if(nominationByCurrentUser) {
        return callback({
            type: "PriorNominationExists",
            trace: new Error("Could not create a new nomination, as one already exists")
        });
    }

    ongoingElection.nominations.push(nomination);

    updateRoleEntry(pgdb, role.canonicalRoleId, role, callback);
}
