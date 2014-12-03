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

        if(req.isAuthenticated()) {
            res.render('room', {
                nickname: req.user.nickname,
                userid: req.user.userid,
                roomid: roomidResult.roomid,
                roomurl: req.params.url,
                boardid: '1',
                message: 'Welcome'
            });
        } else {
            // Should clean this up
            userdb.createUser('Guest' + Math.random().toString().substr(2, 4) + '@' + Math.random().toString().substr(2, 12),
                Math.random().toString().substr(2, 12), // password
                -1, // access
                function(err, guestresult) {
                    if(err) return res.redirect('/r/404');
                    else {
                        roomdb.readModeratorsFor(roomidResult.roomid, function(err, readmodres) {
                            if(err) return res.redirect('/r/404');

                            if(readmodres.length === 0){
                                roomdb.joinRoomMember(roomidResult.roomid, guestresult.userid, function(err, joinresult) {
                                    if(err) return res.redirect('/r/404');

                                    res.render('room', {
                                        nickname: guestresult.nickname,
                                        userid: guestresult.userid,
                                        roomid: roomidResult.roomid,
                                        roomurl: req.params.url,
                                        boardid: '1',
                                        message: 'Welcome'
                                    });
                                });
                            } else {
                                res.render('room', {
                                    nickname: guestresult.nickname,
                                    userid: guestresult.userid,
                                    roomid: roomidResult.roomid,
                                    roomurl: req.params.url,
                                    boardid: '1',
                                    message: 'Welcome'
                                });
                            }
                        });
                    }
                }
            );
        }
    });
});

module.exports = router;
