var express = require('express');
var router = express.Router();

var isAuth = function(req, res, next) {
    if(req.isAuthenticated())
        return next(); // or just next();
    res.redirect('/login');
}

router.get('/', isAuth, function(req, res) {
    res.send("Rooms here - " + req.user.userid);
});

module.exports = router;
