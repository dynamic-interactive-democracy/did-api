module.exports = function(req, res) {
    res.send({ user: req.user });
};
