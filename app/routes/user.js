var express = require('express');
var router = express.Router();

var roomdb = require('../lib/db/roomdb');

function genRID(cb) {
    var rid = Math.random().toString().substr(2, 8);
    // Check to see that RID doesn't already exist
    roomdb.readRoom(rid, function(err, obj) {
        if(!obj || err)
            cb(rid);
        else
            genRID();
    });
}

var isAuth = function(req, res, next) {
    if(req.isAuthenticated())
        return next();
    res.redirect('/');
}

router.get('/', isAuth, function(req, res) {
    roomdb.readRoomsFor(req.user.userid, function(err, result) {
        res.render('user', {
            nickname: req.user.nickname,
            rooms: function(error){
                if(error) return undefined
                else return result
            }(err),
            message: req.flash('usermessage')
        });
    });
});

router.post('/newroom', isAuth, function(req, res) {
    genRID(function(rid) {
        roomdb.createRoom(rid, req.body.roompass, req.user.userid, function(err, result) {
            if(!err) req.flash('usermessage', 'Room could not be created (internal error).');
            else req.flash('usermessage', 'Room successfully created!');

            res.redirect('/user');
        });
    });
});

module.exports = router;
