function redirect(title, message, path, delay) {
	document.write('<h1>' + title + '</h1>');									// write the title
	document.write('<p>' + message + '</p>');									// write the message
	document.write('<p>redirecting in...</p>');									// write redirecting in...

	setTimeout(function() { window.location.replace(path) }, delay);			// redirect to the path after the delay
	countdown(delay);															// write the countdown
}

var counter = 0;																// used to decrement the time
var interval = 1000;															// the interval at which to display the countdown
function countdown(delay) {
	timeleft(delay);															// write the time left
	setInterval(function() { timeleft(delay - counter * interval) }, interval);	// begin writing the time left at the interval
}

function timeleft(time) {
	counter++;																	// increment the counter
	var seconds = time / 1000;													// convert the time into seconds
	document.write('<p>' + seconds + '</p>');										// write the time
}