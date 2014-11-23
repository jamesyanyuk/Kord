var express	= require('express');
var session	= require('express-session');
var flash = require('connect-flash');
var path = require('path');
var favicon	= require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var user = require('./routes/user');
var admin = require('./routes/admin');

var onlinelib = require('./lib/online');

var app	= express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(
	{ secret : 'octocat',
	saveUninitialized : true,
	resave : true }));
app.use(flash());

app.use('/user', user);
app.use('/admin', admin);

app.get('/',
	function (request, response) {
		var user = onlinelib.loggedin(request);
		if (user && user.isadmin) {
			response.redirect('admin/main');
		}
		else {
			response.redirect('/user/main');
		}
	}
);

app.use(
	function(request, response, next) {
		var error = new Error('Not Found');
		error.status = 404;
		next(error);
	}
);

if (app.get('env') === 'development') {
	app.use(
		function(error, request, response, next) {
			response.status(error.status || 500);
			response.render('error',
				{ message: error.message,
				error: error }
			);
		}
	);
}

app.use(
	function(error, request, response, next) {
		response.status(error.status || 500);
		response.render('error', {
			message: error.message,
			error: {} }
		);
	}
);

module.exports = app;


var db = require('./lib/db');
var user = require('./lib/db/userdb');
var room = require('./lib/db/roomdb');
var chat = require('./lib/db/chatdb');
var board = require('./lib/db/boarddb');
var canvas = require('./lib/db/canvasdb');
var resource = require('./lib/db/resourcedb');

function printresult(error, object) {
	if (error) console.log(error);
	else {
		for (var prop in object) {
			console.log(prop + ": " + object[prop]);
		}
	}
}

function printresults(error, objects) {
	if (error) console.log(error);
	else {
		for (var i = 0; i < objects.length; i++) {
			printresult(objects[i]);
		}
	}
}

db.createUser('joe@placebetter', 'userpass', 1,
	function (error, user) {
		console.log('create user:');
		printresult(error, user);
	}
);

// db.createUser('joe' + Math.random(), 'userpass' + Math.random(), 1,
// 	function (error, user) {
// 		console.log('create user:');
// 		printresult(error, user);
// 	}
// );

// db.readUser(1,
// 	function (error, user) {
// 		console.log('read user:');
// 		printresult(error, user);

// 		user.userpass = 'betterpass';

// 		db.updateUser(user,
// 			function (error, user) {
// 				console.log('update user:');
// 				printresult(error, user);
// 			}
// 		);
// 	}
// );

// db.readModeratorsFor(1,
// 	function (error, users) {
// 		console.log('read moderators for:');
// 		printresults(error, users);
// 	}
// );

// db.readMembersFor(2,
// 	function (error, users) {
// 		console.log('read members for:');
// 		printresults(error, users);
// 	}
// );

// db.destroyUser(4,
// 	function (error, user) {
// 		console.log('destroy user:');
// 		printresult(error, user);
// 	}
// );


// var joe = db.createUser('joe' + Math.random(), 'userpass' + Math.random(), 1,
// 	function (error, user) {
// 		console.log('create user:');
// 		printresult(error, user);

// 		db.createRoom('http://' + Math.random(), 'bestpass' + Math.random(), user.userid,
// 			function (error, room) {
// 				console.log('create room:');
// 				printresult(error, room);
// 			}
// 		);
// 	}
// );

// db.readRoom(1,
// 	function (error, room) {
// 		console.log('read room:');
// 		printresult(error, room);
// 	}
// );

// db.readRoomsFor(7,
// 	function (error, rooms) {
// 		console.log('read rooms for:');
// 		printresults(error, rooms);
// 	}
// );

// db.authenticateUser('user1@place.com', 'pass1',
// 	function (error, result) {
// 		console.log('authenticate user:');
// 		printresult(error, result);
// 	}
// );