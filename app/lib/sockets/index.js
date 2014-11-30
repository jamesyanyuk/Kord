var userdb = require('../db/userdb');
var roomdb = require('../db/roomdb');

var rooms = require('../../app.js');
var idmap = [];

// server
module.exports = function(io) {
    io.on('connection', function(socket) {
        socket.on('request_memberlist', function(data) {
            if (rooms[data.roomid + ''] === undefined) {
                rooms[data.roomid + ''] = {};
                rooms[data.roomid + '']['online'] = {};
                rooms[data.roomid + '']['locked'] = {};
            }
            // rooms[data.roomid + '']['online'][data.userid + ''] = data;

            for (var prop in data) {
                console.log('request: ' + prop + ': ' + data[prop]);
            }

            socket.emit('receive_memberlist', rooms[data.roomid + '']['online']);
        });

        socket.on('adduser', function(data) {
            // Join client to specified roomid channel
            socket.join('' + data.roomid);
            var usrid = data.userid;
            rooms[data.roomid + '']['online'][usrid + ''] = data.nickname;
            idmap[socket.id] = [data.roomid + '', data.userid + ''];
            io.to('' + data.roomid).emit('newconnection', {
                nickname: data.nickname,
                userid: data.userid
            });
            for (var prop in rooms[data.roomid + '']['online']) {
                // for (var prop2 in data) {
                //     console.log('add user: ' + prop2 + ': ' + data[prop2]);
                // }
                console.log(prop + ': ' + rooms[data.roomid + '']['online'][prop]);
                // console.log('.');
                // console.log('add user: ' + rooms[data.roomid + '']['online']['user']);
            }
        });

        socket.on('disconnect', function() {
            var roomid = idmap[socket.id][0];
            var userid = idmap[socket.id][1];
            var nickname = rooms[roomid]['online'][userid];

            console.log(userid + ' left.');

            userdb.readUser(userid, function(err, res) {
                if(!err) {
                    if(res.access === -1) {
                        // Detroy the guest account
                        userdb.destroyUser(userid, function(destroyerr, result) {
                            if(destroyerr) console.log('Could not remove guest user ' + userid);
                        });

                        // If only moderator was said guest, destroy room
                        roomdb.readModeratorsFor(roomid, function(readmoderr, readmodresult) {
                            if(err) {
                                console.log('Error reading moderators for room (internal error 1) ' + roomid + ' - ' + readmoderr);
                            } else {
                                //console.log('readmodresult.length: ' + readmodresult.length + ' - ' + 'readmodresult[0].userid: ' + readmodresult[0].userid);
                                if(!readmodresult || (readmodresult.length === 1 && readmodresult[0].userid === userid)){
                                    roomdb.destroyRoom(roomid, function(roomdestroyerr, roomdestroyresult) {
                                        if(err) console.log('Could not leave room (internal error 2).');
                                    });
                                } else {
                                    roomdb.unjoinRoomMember(roomid, userid, function(unjoinerr, unjoinresult) {
                                        if(err) console.log('Could not leave room (internal error 3).');
                                    });
                                }
                            }
                        });
                    }
                }
            });

            socket.broadcast.to(roomid).emit('disconnection', {
                nickname: nickname,
                userid: userid
            });

            delete idmap[socket.id];
            delete rooms[roomid]['online'][userid];
        });

        socket.on('draw',
            function (data) {
                // this will send actual objects
                // need to send room id, board id, actual drawing object
                // tell all clients that a new things need to be added and drawn
                //
            }
        );

        socket.on('erase',
            function (data) {
                // rooms[data.roomid]['locked']
            }
        );

        socket.on('lock',
            function (data) {
                //
            }
        );

        socket.on('move',
            function (data) {

            }
        );

        socket.on('unlock',
            function (data) {
                //
            }
        );

    });
}
