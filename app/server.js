// Temp node.js app to test our server
var express = require('express');

var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	res.send("Welcome to kord.io! We're under construction.");
});

app.get('*', function (req, res) {
	res.status(404).send("Sorry. This page doesn't exist yet. :(");
});

var server = app.listen(80, function () {
	console.log('Listening on port %d', server.address().port);
});

