const version = require("../package").version;

module.exports = (pgdb) => {
    return (req, res) => canary(pgdb, req, res);
};

function canary(pgdb, req, res) {
    getPostgresStatus(pgdb, (error, postgresStatus) => {
        if(error) {
            return res.send({
                version,
                status: "NOT OK",
                postgres: error
            });
        }
        return res.send({
            version,
            status: "OK",
            postgres: postgresStatus
        });
    });
}

function getPostgresStatus(db, callback) {
    db.query("SELECT VERSION() AS version, NOW() as datetime", (error, result) => {
        if(error) return callback({ status: "NOT OK", error: error.code });
        callback(null, {
            status: "OK",
            version: result.rows[0].version,
            datetime: result.rows[0].datetime
        });
    });
}
