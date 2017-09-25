const getRole = require("./getRole");
const addRoleShortcuts = require("./addRoleShortcuts");

module.exports = function(req, res) {
    getRole(req.pgdb, `${req.circle.circleId}/${req.params.roleId}`, (error, role) => {
        if(error && error.type == "NotFound") {
            return res.status(404).send({
                status: "Role does not exist"
            });
        }
        if(error) {
            req.log.error({ error }, "Error while gettings role");
            return res.sendStatus(500);
        }
        res.send({ role: addRoleShortcuts(role) });
    });
};
