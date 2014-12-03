var express = require('express');
var router = express.Router();

var roomdb = require('../lib/db/roomdb');

function genRID(cb) {
    var rid = Math.random().toString().substr(2, 8);
    // Check to see that RID doesn't already exist
    roomdb.readRoomByUrl(rid, function(err, obj) {
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

// GET user/room view
router.get('/', isAuth, function(req, res) {
    roomdb.readRoomsFor(req.user.userid, function(err, result) {
        res.render('user', {
            nickname: req.user.nickname,
            rooms: function(error){
                if(error) return [];
                else return result;
            }(err),
            message: req.flash('usermessage')
        });
    });
});

// Create a new room
router.post('/newroom', isAuth, function(req, res) {
    roomdb.readRoomsFor(req.user.userid, function(err, result) {
        console.log('\n' + err);
        console.log(req.user + ' - ' + req.user.userid + '\n');
        if(err) {
            req.flash('usermessage', 'Room could not be created (internal error 1).');
            res.redirect('/user');
        } else {
            if(result.length >= roomdb.MAX_ROOMS) {
                req.flash('usermessage',
                    'You\'ve already joined the max number of rooms (' + roomdb.MAX_ROOMS + ')!');
                res.redirect('/user');
            } else {
                genRID(function(rid) {
                    roomdb.createRoom(rid, req.body.roompass, req.user.userid, function(err, result) {
                        if(err) req.flash('usermessage', 'Room could not be created (internal error 2).');
                        else req.flash('usermessage', 'Room successfully created!');

                        res.redirect('/user');
                    });
                });
            }
        }
    });
});

/*
 * Leave room with specified rid in query string
 * If only moderator of the room, destroy room
 */
router.get('/leave', isAuth, function(req, res) {
    var rid = req.query.rid;
    if(!rid) res.redirect('/user');

    roomdb.readModeratorsFor(rid, function(err, result) {
        if(err) {
            req.flash('usermessage', 'Could not leave room (internal error 1).');
            res.redirect('/user');
        } else {
            if(result.length === 1 && result[0].userid === req.user.userid){
                roomdb.destroyRoom(rid, function(destroyErr, destroyResult) {
                    if(err) req.flash('usermessage', 'Could not leave room (internal error 2).');
                    else req.flash('usermessage', 'Successfully left (and destroyed) room.');

                    res.redirect('/user');
                });
            } else {
                roomdb.unjoinRoomMember(rid, req.user.userid, function(unjoinErr, unjoinResult) {
                    if(err) req.flash('usermessage', 'Could not leave room (internal error 3).');
                    else req.flash('usermessage', 'Successfully left room.');

                    res.redirect('/user');
                });
            }
        }
    });
});

module.exports = router;
module.exports.genRID = genRID;
