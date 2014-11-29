var express = require('express');
var router = express.Router();

var roomdb = require('../lib/db/roomdb');
var userdb = require('../lib/db/userdb');

router.get('/404', function(req, res) {
    res.send('Room doesn\'t exist.');
});

router.get('/:rurl', function(req, res) {
    roomdb.readRoomByUrl(req.params.rurl, function(err, roomidResult) {
        if(err) return res.redirect('/r/404');

        roomdb.readEntireRoom(roomidResult.roomid, function(err, result) {
            if(err) return res.redirect('/r/404');
            var room = result;
            res.render('room', {
                user: function(auth) {
                    if(auth) return req.user;
                    else {
                        userdb.createUser('Guest' + Math.random().toString().substr(2, 4) + '@' + Math.random().toString().substr(2, 12),
                            Math.random().toString().substr(2, 12), // password
                            -1, // access
                            function(err, guestresult) {
                                if(err) return res.redirect('/r/404');
                                else return guestresult; // return guest user
                            }
                        );
                    }
                }(req.isAuthenticated()),
                url: room.url,
                rid: room.roomid,
                message: 'Welcome',
                members: room.members,
                moderators: room.moderators,
                bcount: room.boards.length
            });
        });
    });
});

module.exports = router;
