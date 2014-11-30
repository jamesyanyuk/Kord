window.onload = function () {
	var canvas = document.getElementById('canvas');
	var paper = new Raphael(canvas, 500, 700);
	var mousedown = false;
	var px;
	var py;
	var path;
	var pathString;
	
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
}