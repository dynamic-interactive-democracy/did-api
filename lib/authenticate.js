const auth = require("basic-auth");

module.exports = (req, res, next) => {
    const credentials = auth(req);

    if(!credentials) return res.sendStatus(401);

    req.pgdb.query("SELECT data FROM users WHERE token = $1", [credentials.pass], (error, result) => {
        if(error) {
            req.log.error({ error }, "Could not authenticate");
            return res.sendStatus(500);
        }

        if(!result.rows.length) return res.sendStatus(401);

        if(result.rows[0].data.userId === credentials.name) {
            // potentially look at authenticated type to determine who the user should be
            req.user = {
                name: result.rows[0].data.name,
                userId: result.rows[0].data.userId
            };
            return next();
        }

        res.sendStatus(401);
    });
};
