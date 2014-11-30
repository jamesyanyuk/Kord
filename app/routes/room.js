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

            if(req.isAuthenticated()) {
                res.render('room', {
                    nickname: req.user.nickname,
                    userid: req.user.userid,
                    url: room.url,
                    roomid: room.roomid,
                    message: 'Welcome',
                    members: room.members,
                    moderators: room.moderators,
                    bcount: room.boards.length
                });
            } else {
                // Should clean this up
                userdb.createUser('Guest' + Math.random().toString().substr(2, 4) + '@' + Math.random().toString().substr(2, 12),
                    Math.random().toString().substr(2, 12), // password
                    -1, // access
                    function(err, guestresult) {
                        if(err) return res.redirect('/r/404');
                        else {
                            if(room['moderators'].length === 0){
                                roomdb.joinRoomModerator(room.roomid, guestresult.userid, function(err, joinresult) {
                                    if(err) return res.redirect('/r/404');
                                    room['moderators'] = [guestresult];

                                    res.render('room', {
                                        nickname: guestresult.nickname,
                                        userid: guestresult.userid,
                                        url: room.url,
                                        roomid: room.roomid,
                                        message: 'Welcome',
                                        members: room.members,
                                        moderators: room.moderators,
                                        bcount: room.boards.length
                                    });
                                });
                            } else {
                                res.render('room', {
                                    nickname: guestresult.nickname,
                                    userid: guestresult.userid,
                                    url: room.url,
                                    roomid: room.roomid,
                                    message: 'Welcome',
                                    members: room.members,
                                    moderators: room.moderators,
                                    bcount: room.boards.length
                                });
                            }
                        }
                    }
                );
            }
        });
    });
});

module.exports = router;
