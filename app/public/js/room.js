var socket = io.connect('http://' + window.location.host);

// run once
socket.on('connect', function() {
    socket.emit('request_memberlist', { roomid: <%= roomid %> });
    socket.emit('adduser', {
        roomid: <%= roomid %>,
        nickname: '<%= nickname %>',
        userid: <%= userid %>
    });
});

socket.on('receive_memberlist', function(data) {
    for(var prop in data) {
        console.log('---- ' + prop + ' ---- ' + data[prop]);
        $('#onlineusers').append($('<li id="' + prop + '">').text(data[prop]));
    }
});

socket.on('newconnection', function(data) {
    console.log('eeeeeee');
    $('#onlineusers').append($('<li id="' + data.userid + '" %>">').text(data.nickname));
});

socket.on('disconnection', function(data) {
    $('#' + data.userid).remove();
    console.log(data.nickname + ' disconnected.');
});