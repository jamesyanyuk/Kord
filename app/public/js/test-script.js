

window.onload = function () {
	var canvas = document.getElementById('canvas');
	var paper = new Raphael(canvas, 800, 800);
	var px;
	var py;
	var mousedown = false;
	var path;
	var path_string;
	var cursors = {};
	var selection;
	
	////
	// client
	////
	
	socket.on('connect',
		function(data) {
		    print_data('connect', data);
		    socket.emit('join_board',
				{ boardid: boardid,
		        userid: userid }
			);
		}
	);
	
	$(canvas).mousedown(
		function(event) {
			mousedown = true;
			var x = event.offsetX;
			var y = event.offsetY;
			
			// paper.setStart();
			
			path_string = 'M' + x + ' ' + y + 'l0 0';
			path = paper.path(path_string).attr(
				{ 'stroke-width' : 5 }
			);
		}
	);
	$(document).mousemove(
		function(event) {
			if (mousedown) {
				var x = event.offsetX;
				var y = event.offsetY;
				path_string += 'l' + (x - px) + ' ' + (y - py);
				path.attr('path', path_string);
				// paper.
			}
			
			px = event.offsetX;
			py = event.offsetY;
		}
	);
	function emit() {
		socket.emit('mousemove',
			{ userid : userid,
			roomid : roomid,
			boardid : boardid,
			cx : px,
			cy : py }
		);
	}
	setInterval(emit, 20);
	$(document).mouseup(
		function(event) {
			if (mousedown) {
				// selection = paper.setFinish();
				// var json = JSON.stringify(path_string);		
				socket.emit('draw',
					{ boardid: boardid,
					roomid: roomid,
					userid: userid,
					path: path_string }
				);
			}
			mousedown = false;			
		}
	);
	
	
	////
	// server
	////

	socket.on('cursorupdate',
		function(data) {
			// print_data('cursorupdate', data);
			if(cursors[data.userid]) {
				cursors[data.userid].attr(
					{ 'cx' : data.cx,
					'cy' : data.cy }
				);
			}
			else {
				var f = Raphael.getColor();
				var s = Raphael.getColor();
				var circle = paper.circle(data.cx, data.cy, 10).attr(
					{ 'fill' : f,
					'stroke' : s,
					'stroke-width' : 5 }
				);
				cursors[data.userid] = circle;
			}
		}
	);
	
	socket.on('add',
		function(data) {
			print_data('add', data);
			
			paper.path(data.path);	
		}
	);
	
	socket.on('move',
		function(data) {
			
		}
	);
	
	socket.on('remove',
		function(data) {
			
		}
	);
	
	socket.on('hover',
		function(data) {
			
		}
	);
	
	socket.on('double click',
		function(data) {
			
		}
	);
	
	socket.on('transform',
		function(data) {
			
		}
	);

	function print_data(message, data) {
	    console.log(message + '>');
	    for (var prop in data) {
	        console.log(prop + ': ' + data[prop]);
	    }
	}
}