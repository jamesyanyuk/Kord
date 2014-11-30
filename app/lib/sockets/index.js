var userdb = require('../db/userdb');

var rooms = require('../../app.js');
var idmap = [];

// server
module.exports = function(io) {
    io.on('connection', function(socket) {
        socket.on('request_memberlist', function(data) {
            if (rooms[data.roomid + ''] === undefined) {
                rooms[data.roomid + ''] = {};
                rooms[data.roomid + '']['online'] = {};
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

            // userdb.destroyUser(data.userid, function(err, result) {
            //     if(err) console.log('Could not remove guest user ' + data.userid);
            // });
            
            socket.broadcast.to(roomid).emit('disconnection', {
                nickname: nickname,
                userid: userid
            });

            delete idmap[socket.id];
            delete rooms[roomid]['online'][userid];
        });
    });
}
