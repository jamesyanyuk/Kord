var express = require('express');
var router = express.Router();

var roomdb = require('../lib/db/roomdb');
var userdb = require('../lib/db/userdb');
var boarddb = require('../lib/db/boarddb');

router.get('/404', function(req, res) {
    res.send('Room doesn\'t exist.');
});

router.get('/:rurl', function(req, res) {
    roomdb.readRoomByUrl(req.params.rurl, function(err, roomidResult) {
        if(err) return res.redirect('/r/404');

        if(req.isAuthenticated()) {
            // if(!rooms[roomidResult.roomid][req.user.userid]) {
                boarddb.readBoardsFor(roomidResult.roomid, function(err, boardres) {
                    res.render('room', {
                        nickname: req.user.nickname,
                        userid: req.user.userid,
                        roomid: roomidResult.roomid,
                        roomurl: req.params.url,
                        boardid: boardres[0].boardid,
                        message: 'Welcome to your room!'
                    });
                });
            // } else {
            //     res.send('You\'re already connected to this room!');
            // }
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

                            boarddb.readBoardsFor(roomidResult.roomid, function(err, boardres) {
                                if(readmodres.length === 0){
                                    roomdb.joinRoomMember(roomidResult.roomid, guestresult.userid, function(err, joinresult) {
                                        if(err) return res.redirect('/r/404');

                                        res.render('room', {
                                            nickname: guestresult.nickname,
                                            userid: guestresult.userid,
                                            roomid: roomidResult.roomid,
                                            roomurl: req.params.url,
                                            boardid: boardres[0].boardid,
                                            message: 'Welcome to your room!'
                                        });
                                    });
                                } else {
                                    res.render('room', {
                                        nickname: guestresult.nickname,
                                        userid: guestresult.userid,
                                        roomid: roomidResult.roomid,
                                        roomurl: req.params.url,
                                        boardid: boardres[0].boardid,
                                        message: 'Welcome to your room!'
                                    });
                                }
                            });
                        });
                    }
                }
            );
        }
    });
});

module.exports = router;
