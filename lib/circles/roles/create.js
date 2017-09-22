module.exports = function(req, res) {
    const roleId = req.body.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
    const canonicalRoleId = `${req.circle.circleId}/${roleId}`;

    //TODO: Validate term

    let role = {
        roleId,
        canonicalRoleId,
        title: req.body.title,
        person: req.user.userId,
        effects: [],
        term: req.body.term || null,
        areaOfResponsibility: req.body.areaOfResponsibility || "",
        desiredCharacteristics: req.body.desiredCharacteristics || "",
        previousRoleOwners: [],
        evaluations: [],
        elections: []
    };

    if(!role.title) return res.status(400).send({ status: "Role title is missing" });

    insertRoleOrRetryWithNewRoleId(req, role, (error, result) => {
        if(error) {
            req.log.error({ error }, "Error while creating role");
            return res.sendStatus(500);
        }

        const role = result.rows[0].data;

        res.status(201).send({ status: "Role created", role });
    });
};

function insertRoleOrRetryWithNewRoleId(req, role, callback) {
    insertRole(req, role, (error, result) => {
        if(error && error.constraint == "roles_pkey") {
            return req.pgdb.query("SELECT id FROM roles WHERE id LIKE $1", [`${role.canonicalTaskId}%`], (error, result) => {
                if(error) {
                    req.log.error({ error }, "Failed to get existing role IDs similar to the natural one for the new role");
                    return res.sendStatus(500);
                }
                let existingCanonicalIds = result.rows.map(row => row.id);
                let newRoleId = determineNewTaskId(existingCanonicalIds, req.circle.circleId, role.roleId);
                role.roleId = newRoleId;
                role.canonicalRoleId = `${req.circle.circleId}/${newRoleId}`;
                insertRole(req, role, callback);
            });
        }
        callback(error, result);
    });
}

function insertRole(req, role, callback) {
    req.pgdb.query("INSERT INTO roles VALUES($1::text, $2::json) RETURNING data", [role.canonicalRoleId, role], callback);
}

function determineNewTaskId(existingCanonicalIds, circleId, roleId) {
    let suffixes = existingCanonicalIds.map(canonicalId => {
        if(canonicalId.length > circleId.length + roleId.length + 1) {
            return canonicalId.substring(circleId.length + roleId.length + 1);
        }
        return "";
    }).filter(suf => suf != "");
    let numericalSuffixes = suffixes.map(suf => {
        let match = suf.match(/^\-([0-9]+)$/);
        if(!match) return null;
        return parseInt(match[1]);
    });
    let sortedNumericalSuffixes = numericalSuffixes.sort((a,b) => {
        if(a < b) return -1;
        if(a == b) return 0;
        return 1;
    });
    if(sortedNumericalSuffixes.length) {
        let lastNumericalSuffix = sortedNumericalSuffixes[sortedNumericalSuffixes.length - 1];
        return roleId + "-" + (lastNumericalSuffix + 1);
    }
    return roleId + "-1";
}
