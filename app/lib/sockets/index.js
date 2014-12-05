var userdb = require('../db/userdb');
var roomdb = require('../db/roomdb');
var elementdb = require('../db/elementdb');

var rooms = require('../../app.js');
var idmap = [];

// server
module.exports = function(io) {
    io.on('connection', function(socket) {

        ////
        // room
        ////

        // when a user joins a room
        socket.on('join_room',
            function (data) {
                print_data('join_room', data);

                roomdb.readMembersFor(data.roomid, function(err, res) {
                    if(!err) console.log('Members ----->>>> ' + res.length);
                });

                socket.join('r' + data.roomid);
                // if the room doesn't exist
                if (!rooms[data.roomid]) {
                    rooms[data.roomid] = {};
                }
                // update the mappings
                rooms[data.roomid][data.userid] = data.nickname;
                idmap[socket.id] = [data.roomid, data.userid];

                roomdb.readEntireRoom(data.roomid, function(err, room) {
                    if(err) return console.log('Error 34');

                    socket.emit('users', {
                        online : rooms[data.roomid],
                        members : room.members,
                        moderators : room.moderators,
                        bcount : room.boards.length,
                        roomurl : room.roomurl
                    });
                });

                // tell all other sockets that a new connection was made
                socket.broadcast.to('r' + data.roomid).emit('newconnection', {
                    nickname: data.nickname,
                    userid: data.userid
                });
            }
        );

        socket.on('disconnect', function(data) {
            print_data('disconnect', data);
            if (!idmap[socket.id]) return;

            var roomid = idmap[socket.id][0];
            var userid = idmap[socket.id][1];

            var nickname = rooms[roomid][userid];

            console.log(userid + ' left.');

            userdb.readUser(+userid, function(err, res) {
                if(err) console.log('Error 76: ' + err);
                else {
                    if(res.access === -1) {
                        // If only member was said guest, destroy room
                        roomdb.readMembersFor(+roomid, function(readmemerr, readmemresult) {
                            if(err) {
                                console.log('Error reading moderators for room (internal error 1) ' + roomid + ' - ' + readmemerr);
                            } else {
                                roomdb.unjoinRoomMember(+roomid, +userid, function(unjoinerr, unjoinresult) {
                                    if(err) console.log('Could not leave room (internal error 3).');

                                    // Detroy the guest account
                                    userdb.destroyUser(+userid, function(destroyerr, result) {
                                        if(destroyerr) console.log('Could not remove guest user ' + userid);
                                    });

                                    if(readmemresult.length === 1 && readmemresult[0].userid === +userid){
                                        roomdb.destroyRoom(+roomid, function(roomdestroyerr, roomdestroyresult) {
                                            if(err) console.log('Could not leave room (internal error 2).');
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            });

            io.to('r' + roomid).emit('disconnection', {
                nickname: nickname,
                userid: userid
            });

            delete idmap[socket.id];
            delete rooms[roomid][userid];
        });

        ////
        // board
        ////

        socket.on('join_board',
            function (data) {
                print_data('join_board', data);

                socket.join('b' + data.boardid);
                elementdb.readElementsFor(data.boardid,
                    function (error, result) {
                        if (error) return callback(error);

                        var elements = result;
                        socket.emit('elements', elements);
                    }
                );
                // // if the room doesn't exist
                // if (!boards[data.boardid]) {
                //     boards[data.boardid] = {};
                // }
                // // update the mappings
                // boards[data.boardid][data.userid] = data.nickname;
                // // this should have an array of board ids?
                // idmap[socket.id] = [data.boardid, data.userid];
                //
                // // send the socket that joined the members list
                // socket.emit('members', rooms[data.roomid]);
                // // tell all other sockets that a new connection was made
                // io.to(data.roomid).emit('newcursor', {
                //     nickname: data.nickname,
                //     userid: data.userid
                // });
            }
        );

        socket.on('mousemove',
            function (data) {
                // print_data('mousemove', data);
                socket.broadcast.to('b' + data.boardid).emit('cursorupdate', data);
            }
        );

        socket.on('create',
            function (data) {
                print_data('create', data);
                socket.broadcast.to('b' + data.boardid).emit('add', data);
                
                elementdb.createElement(
                    data.elementid,
                    data.attrs, data.boardid,
                    function (error, result) {
                        console.log(error);
                        console.log(result);
                        // if (error) return callback(error);
                    }
                );
            
            }
        );

        socket.on('drag',
            function (data) {
                print_data('drag', data);
                elementdb.updateElement(elementdb.create(data.elementid, data.transformationstring),
                    function (error, result) {
                        socket.broadcast.to('b' + data.boardid).emit('transform', data);
                    }
                );
            }
        );

        socket.on('destroy',
            function (data) {
                print_data('destroy', data);
                socket.broadcast.to('b' + data.boardid).emit('remove', data);
                elementdb.destroyElement(data.elementid,
                    function (error, result) {
                        // if (error) return callback(error);
                    }
                );
                // delete boards[data.boardid][elementid]
            }
        );

        socket.on('lock',
            function (data) {
                //
            }
        );

        socket.on('unlock',
            function (data) {
                //
            }
        );
    });
}

function room(data) {
    return 'r' + data.roomid;
}

function board(data) {
    return 'b' + data.boardid;
}

function print_data(message, data) {
    console.log(message + '>');
    for (var prop in data) {
        console.log(prop + ': ' + data[prop]);
    }
}
