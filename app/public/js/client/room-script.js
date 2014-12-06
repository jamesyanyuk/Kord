// run once
socket.on('connect', function(data) {
    print_data('connect', data);
    socket.emit('join_room', {
        roomid: roomid,
        nickname: nickname,
        userid: userid
    });
});

socket.on('users', function(data) {
    print_data('users', data);

    document.title = 'Room ' + data.roomurl;

    for(var prop in data.online) {
        //$('#onlineusers').append($('<li id="on' + prop + '">').text(data.online[prop]));
        $('<li id="on' + prop + '">').text(data.online[prop]).hide().appendTo($('#onlineusers')).fadeIn();
    }

    for(i = 0; i < data.members.length; i++) {
        //$('#members').append($('<li id="mem' + data.members[i].userid + '">').text(data.members[i].nickname));
        $('<li id="mem' + data.members[i].userid + '">').text(data.members[i].nickname).hide().appendTo($('#members')).fadeIn();
    }

    for(i = 0; i < data.moderators.length; i++) {
        //$('#moderators').append($('<li id="mod' + data.moderators[i].userid + '">').text(data.moderators[i].nickname));
        $('<li id="mod' + data.moderators[i].userid + '">').text(data.moderators[i].nickname).hide().appendTo($('#moderators')).fadeIn();
    }

    $('#bcount').text(data.bcount).hide().fadeIn();

    $('#urlHeader').text(data.roomurl).hide().fadeIn();
    $('#url').text(data.roomurl).hide().fadeIn();
});

socket.on('newconnection', function(data) {
    print_data('newconnection', data);
    $('#onlineusers').append($('<li id="on' + data.userid + '" %>">').text(data.nickname));
});

socket.on('disconnection', function(data) {
    print_data('disconnection', data);
    $('#on' + data.userid).remove();
});

function print_data(message, data) {
    console.log(message + '>');
    for (var prop in data) {
        console.log(prop + ': ' + data[prop]);
    }
}


////
// chat
////

$(
	function() {																// on load of page
		$('#datasend').click(
			function() {														// when the client clicks SEND
				var message = $('#data').val();
				// $('#data').val('');
                print_data('sendchat', message);
				socket.emit('sendchat',
                    { roomid: roomid,
                    boardid: boardid,
                    userid: userid,
                    nickname: nickname,
                    message: message }                							// tell server to execute 'sendchat' and send along one parameter
                );
			}
		);
		$('#data').keypress(
			function(e) {										// when the client hits ENTER on their keyboard
                if(e.which == 13 || e.which == 10) {
					$(this).blur();
					$('#datasend').submit();
                    // e.preventDefault();
				}
			}
		);
	}
);

socket.on('updatechat',
	function (data) {
        print_data('updatechat', data);
		$('#conversation').append('<b>'+ data.nickname + ':</b> ' + data.message + '<br>');
	}
);