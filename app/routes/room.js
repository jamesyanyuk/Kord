var express = require('express');
var router = express.Router();
var socket

var roomdb = require('../lib/db/roomdb');

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
                nickname: function(auth) {
                    if(auth) return req.user.nickname;
                    else return 'Guest';
                }(req.isAuthenticated()),
                url: room.url,
                message: 'Welcome',
                members: room.members,
                moderators: room.moderators,
                bcount: room.boards.length
            });
        });
    });
});

module.exports = router;
