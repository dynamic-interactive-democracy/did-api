const _ = require("lodash");

module.exports = function(req, res) {

    //TODO: Validate term

    let roleParams = {
        title: req.body.title,
        person: req.body.person,
        effects: req.body.effects,
        term: req.body.term,
        areaOfResponsibility: req.body.areaOfResponsibility,
        desiredCharacteristics: req.body.desiredCharacteristics
    };

    const cleanRoleParams = _.omitBy(roleParams, _.isUndefined);

    // TODO assert that person exists

    if(_.isEmpty(cleanRoleParams)) {
        req.log.warn("Request contained no values to update role with");
        return res.status(400).send({ status: "There are no values in request" });
    }

    req.pgdb.query("SELECT data FROM roles WHERE id=$1", [`${req.circle.circleId}/${req.params.roleId}`], (error, result) => {
        if(!result.rowCount) {
            return res.status(404).send({
                status: "Role does not exist"
            });
        }

        const updatedRole = _.merge(result.rows[0].data, cleanRoleParams);

        req.pgdb.query("UPDATE roles SET data=$1 WHERE id=$2 RETURNING id, data", [updatedRole, updatedRole.canonicalRoleId], (error, result) => {
            if(error) {
                req.log.error({ error }, "Error while updating role");
                return res.sendStatus(500);
            }

            const role = result.rows[0].data;

            res.status(200).send({ status: "Role updated", role });
        });
    });
};
