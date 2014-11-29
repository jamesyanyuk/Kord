window.onload = function () {
	var canvas = document.getElementById('canvas'),
	    paper = new Raphael(canvas, 500, 700),
	    mousedown = false,
	    lastX, lastY, path, pathString;

	$(canvas).mousedown(function (e) {
	    mousedown = true;

	    var x = e.offsetX,
	        y = e.offsetY;

	    pathString = 'M' + x + ' ' + y + 'l0 0';
	    path = paper.path(pathString);

	    lastX = x;
	    lastY = y;
	});
	$(document).mouseup(function () {
	    mousedown = false;
	});

	$(canvas).mousemove(function (e) {
	    if (!mousedown) {
	        return;
	    }

	    var x = e.offsetX,
	        y = e.offsetY;

	    pathString += 'l' + (x - lastX) + ' ' + (y - lastY);
	    path.attr('path', pathString);

	    lastX = x;
	    lastY = y;
	});
}