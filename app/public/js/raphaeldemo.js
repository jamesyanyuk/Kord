var socket = io.connect('http://' + window.location.host);

window.onload = function () {
	var canvas = document.getElementById('canvas');
	var paper = new Raphael(canvas, 500, 700);
	var mousedown = false;
	var px;
	var py;
	var path;
	var pathString;
	
	var cursor = paper.circle(0, 0, 10).attr(
		{fill: '#9cf', stroke: '#ddd', 'stroke-width': 5}
	);
	
	$(canvas).mousedown(
		function (event) {
			mousedown = true;
			var x = event.offsetX;
			var y = event.offsetY;
			
			pathString = 'M' + x + ' ' + y + 'l0 0';
			path = paper.path(pathString);
			
			px = x;
			py = y;
		}
	);
	$(document).mouseup(
		function (event) {
			mousedown = false;
		}
	);
	$(canvas).mousemove(
		function (event) {
			if (!mousedown) return;
			var x = event.offsetX;
			var y = event.offsetY;
			
			pathString += 'l' + (x - px) + ' ' + (y - py);
			path.attr('path', pathString);
			
			px = x;
			py = y;
		}
	);
	$(document).mousemove(
		function (event) {
			console.log('herererer');
			px = event.offsetX;
			py = event.offsetY;
			
			cursor.attr(
				{ 'cx' : px,
				'cy' : py }
			);
			
		}
	);
	
	function emit() {
		socket.emit('movemouse',
			{ userid : 1,
			roomid : 2,
			boardid : 3,
			cx : px,
			cy : py }
		);
	}
	
	setInterval(emit, 50);
	
	socket.on('cursorupdate',
		function (data) {
		}
	);
	// put socket.emit outside -- called at a set interval
	// mouse move just builds up the buffer
}