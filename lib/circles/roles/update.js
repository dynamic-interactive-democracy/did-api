const _ = require("lodash");
const getRole = require("./getRole");
const updateRoleEntry = require("./updateRoleEntry");
const addRoleShortcuts = require("./addRoleShortcuts");

module.exports = function(req, res) {
    const cleanRoleParams = cleanParams(req.body, [
        "title", "effects", "areaOfResponsibility", "desiredCharacteristics"
    ]);

    //TODO: Validate term

    if(_.isEmpty(cleanRoleParams)) {
        req.log.warn("Request contained no values to update role with");
        return res.status(400).send({ status: "There are no values in request" });
    }

    updateRole(req.pgdb, `${req.circle.circleId}/${req.params.roleId}`, cleanRoleParams, (error, role) => {
        if(error && error.type == "NotFound") {
            return res.status(404).send({
                status: "Role does not exist"
            });
        }
        if(error) {
            req.log.error({ error }, "Error while updating role");
            return res.sendStatus(500);
        }

        res.status(200).send({ status: "Role updated", role: addRoleShortcuts(role) });
    });
};

function cleanParams(body, params) {
    let obj = {}
    params.forEach(param => {
        if(body[param]) obj[param] = body[param];
    });
    return obj;
}

function updateRole(pgdb, id, params, callback) {
    getRole(pgdb, id, (error, role) => {
        if(error) {
            return callback(error);
        }

        const updatedRole = _.merge(role, params);

        updateRoleEntry(pgdb, updatedRole.canonicalRoleId, updatedRole, callback);
    });
}
