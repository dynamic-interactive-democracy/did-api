const _ = require("lodash");

module.exports = (role) => {
    let roleOwners = role.roleOwners.map((owner) => {
        return { person: owner.userId, term: owner.term };
    });
    return _.defaults(_.last(roleOwners), role);
};
