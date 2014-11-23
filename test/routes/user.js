var express = require('express');
var router = express.Router();
var userslib = require('../lib/users');
var onlinelib = require('../lib/online');

var adminrequired = false;

router.get('/main',
	function (request, response) {
		onlinelib.requirelogin(request, response, adminrequired,			// require the user to be logged in
			function (request, response, user) {
				response.render('usermain',									// render the user main page
					{ title : "user main",
					username : user.username }
				);
			}
		);
	}
);

router.get('/login',
	function (request, response) {
		response.render('login',											// render the login page
			{ title : "login",
			error: request.flash('error') || '' }
		);
	}
);

router.post('/auth',
	function (request, response) {
		userslib.authenticate(request.body.username, request.body.password,	// authenticate the user
			function (error, user) {
				if (error) {												// if there was an error
					request.flash('error', error);							// flash an error
					response.redirect('/user/login');						// redirect to the login page
				}
				else {														// if the user's password is correct
					onlinelib.login(request, user);							// log the user into the system
					if (user.isadmin) {										// if the user is an admin
						response.redirect('/admin/main');					// redirect to the main admin page
					}
					else {													// if the user is a regular user
						response.redirect('/user/main');					// redirect to the main user page
					}
				}
			}
		);
	}
);

router.get('/logout', 
	function (request, response) {
		onlinelib.requirelogin(request, response, adminrequired,			// require the user to be logged in
			function (request, response, user) {
				onlinelib.logout(request);									// log the user out
				response.redirect('/user/login');							// redirect to the login page
			}
		);
	}
);

router.get('/online',
	function (request, response) {
		onlinelib.requirelogin(request, response, adminrequired,			// require the user to be logged in
			function (request, response, user) {
				response.render('useronline',								// render the user online page
					{ title : 'user view',
					online : JSON.stringify(onlinelib.online) }
				);
			}
		);
	}
);

module.exports = router;