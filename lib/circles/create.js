module.exports = function(req, res) {
    if(!req.body.name) return res.status(401).send({ status: "Circle name is missing" });

    const circle = {
        name: req.body.name || null,
        vision: req.body.vision || null,
        mission: req.body.mission || null,
        aim: req.body.aim || null,
        expectationsForMembers: [],
        members: [{ id: req.user.id, invitationState: "member" }],
        contactPerson: req.user.id,
        fullState: req.body.fullState || "lookingForMore",
    };

    createCircle(req.pgdb, circle, (error, circle) => {
        if(error && error.constraint === "circle_data_name_idx") {
            req.log.warn("Attemped to create circle with pre-existing name");
            return res.status(400).send({ status: "Circle name already exists" });
        }
        if(error) {
            req.log.error({ error }, "Error while creating circle");
            return res.sendStatus(500);
        }

        res.status(201).send({ status: "Circle created", circle });
    });
};

function createCircle(pgdb, circle, callback) {
    pgdb.query("INSERT INTO circles VALUES($1::json) RETURNING id, data", [circle], (error, result) => {
        if(error) return callback(error);

        const circle = result.rows[0].data;
        circle.id = result.rows[0].id;

        callback(null, circle);
    });
}
