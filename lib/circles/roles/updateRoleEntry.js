module.exports = updateRoleEntry;

function updateRoleEntry(pgdb, id, data, callback) {
    pgdb.query("UPDATE roles SET data=$1 WHERE id=$2 RETURNING id, data", [data, id], (error, result) => {
        if(error) {
            return callback(error);
        }
        callback(null, result.rows[0].data);
    });
}
