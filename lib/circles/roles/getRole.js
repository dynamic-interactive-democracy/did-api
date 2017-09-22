module.exports = getRole;

function getRole(pgdb, id, callback) {
    getFirstResult(pgdb, "SELECT id, data FROM roles WHERE id = $1", [id], (error, result) => {
        if(error) {
            return callback(error);
        }
        callback(null, result.data);
    });
}

function getFirstResult(pgdb, query, params, callback) {
    pgdb.query(query, params, (error, result) => {
        if(error) {
            return callback(error);
        }
        if(!result.rows.length) {
            return callback({
                type: "NotFound",
                trace: new Error("Failed to retrieve entity")
            });
        }
        callback(null, result.rows[0]);
    });
}
