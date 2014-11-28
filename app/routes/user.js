var express = require('express');
var router = express.Router();

var roomdb = require('../lib/db/roomdb');

function genRID(cb) {
    var uid = Math.random().toString().substr(2, 6);
    // Check to see that RID doesn't already exist
    
}

var isAuth = function(req, res, next) {
    if(req.isAuthenticated())
        return next();
    res.redirect('/');
}

router.get('/', isAuth, function(req, res) {
    roomdb.readRoomsFor(req.user.userid, function(err, result) {
        console.log(result);
        res.render('user', {
            nickname: req.user.nickname,
            rooms: function(error){
                if(error) return undefined
                else return result
            }(err)
        });
    });
});

router.post('/newroom', function(req, res) {
    roomdb.createRoom(genRID(), )
    res.redirect('/user');
});

module.exports = router;
