const version = require("../package").version;

const fs = require("fs");
const path = require("path");

let commit;
fs.stat(path.join(__dirname, "../commit.json"), (err) => {
    if(!err) {
        const json = fs.readFileSync(path.join(__dirname, "../commit.json"), "utf8");
        commit = JSON.parse(json).commit;
        return;
    }
    require("child_process").exec("git rev-parse HEAD", (err, result) => commit = result.trim());
});

module.exports = (pgdb) => {
    return (req, res) => canary(pgdb, req, res);
};

function canary(pgdb, req, res) {
    getPostgresStatus(pgdb, (error, postgresStatus) => {
        if(error) {
            return res.send({
                version,
                commit,
                status: "NOT OK",
                postgres: error
            });
        }
        return res.send({
            version,
            commit,
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
