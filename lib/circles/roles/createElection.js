const _ = require("lodash");
const getRole = require("./getRole");
const updateRoleEntry = require("./updateRoleEntry");
const dateMe = require("../../dateMe.js");

module.exports = function(req, res) {
    let election = {
        nominations: [],
        electee: null,
        summary: null,
        state: "firstRound",
        completedAt: null,
        term: {
            start: req.body.start,
            end: req.body.end
        }
    };

    //TODO: Validate term

    getRole(req.pgdb, `${req.circle.circleId}/${req.params.roleId}`, (error, role) => {
        if(error && error.type == "NotFound") {
            return res.status(404).send({
                status: "Role does not exist"
            });
        }
        if(error) {
            req.log.error({ error }, "Error while checking for ongoing election");
            return res.sendStatus(500);
        }
        if(hasOngoingElection(role)) {
            return res.status(403).send({
                status: "An election is already ongoing. Finish it before starting another."
            });
        }

        role.elections.push(election);

        updateRoleEntry(req.pgdb, role.canonicalRoleId, role, (error) => {
            if(error) {
                req.log.error({ error }, "Error while creating election");
                return res.sendStatus(500);
            }

            res.status(201).send({ status: "Election created", election });
        });
    });
};

function hasOngoingElection(role) {
    return role.elections.some((election) => !election.electee);
}
