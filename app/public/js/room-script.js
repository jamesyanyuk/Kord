// run once
socket.on('connect', function(data) {
    print_data('connect', data);
    socket.emit('join_room', {
        roomid: roomid,
        nickname: nickname,
        userid: userid
    });
});

socket.on('members', function(data) {
    print_data('members', data);
    for(var prop in data) {
        $('#onlineusers').append($('<li id="' + prop + '">').text(data[prop]));
    }
});

socket.on('newconnection', function(data) {
    print_data('newconnection', data);
    $('#onlineusers').append($('<li id="' + data.userid + '" %>">').text(data.nickname));
});

socket.on('disconnection', function(data) {
    print_data('disconnection', data);
    $('#' + data.userid).remove();
});

function print_data(message, data) {
    console.log(message + '>');
    for (var prop in data) {
        console.log(prop + ': ' + data[prop]);
    }
}