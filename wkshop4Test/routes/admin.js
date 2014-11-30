var express = require('express');
var router = express.Router();
var userslib = require('../lib/users');
var onlinelib = require('../lib/online');

var adminrequired = true;
var defaultdelay = 1000;

router.get('/main',
	function (request, response) {
		onlinelib.requirelogin(request, response, adminrequired,					// require the user to be logged in
			function (request, response, user) {
				response.render('adminmain',										// render the admin main page
					{ title : 'admin main',
					username : user.username }
				);
			}
		);
	}
);

router.get('/online',
	function (request, response) {
		onlinelib.requirelogin(request, response, adminrequired,					// require the user to be logged in
			function (request, response, user) {
				response.render('adminonline',										// render the admin online page
					{ title : 'admin user view',
					online : JSON.stringify(onlinelib.online), 
					users : JSON.stringify(userslib.users) }
				);
			}
		);
	}
);

router.get('/createuser',
	function (request, response) {
		onlinelib.requirelogin(request, response, adminrequired,					// require the user to be logged in
			function (request, response, user) {
				response.render('createuser',										// render the create user page
					{ title : 'create user',
					error : request.flash('error') || ''}
				);
			}
		);
	}
);

router.post('/createuserrequest',
	function (request, response) {
		onlinelib.requirelogin(request, response, adminrequired,					// require the user to be logged in
			function (request, response, user) {
				userslib.createuser(request.body.username,							// create a user
					request.body.password, request.body.isadmin,
					function (error, user) {
						if (error) {												// if there was an error
							request.flash('error', error);							// flash the error
							response.redirect('/admin/createuser');					// redirect to the create user page
						}
						else {														// if user was created
							request.flash('title', 'user created');
							request.flash('user', user);							// flash the user
							response.redirect('/admin/usercrud');					// redirect to the user crud page
						}
					}
				)
			}
		);
	}
);

router.get('/deleteuser',
	function (request, response) {
		onlinelib.requirelogin(request, response, adminrequired,					// require the user to be logged in
			function (request, response, user) {
				response.render('deleteuser',										// render the delete user page
					{ title : 'delete user',
					error : request.flash('error') || ''}
				);
			}
		);
	}
);

router.post('/deleteuserrequest',
	function (request, response) {
		onlinelib.requirelogin(request, response, adminrequired,					// require the user to be logged in
			function (request, response, user) {
				userslib.deleteuser(request.body.username,							// delete the user
					function (error, deleteduser) {
						if (error) {												// if there was an error
							request.flash('error', error);							// flash an error
							response.redirect('/admin/deleteuser');					// redirect to the delete user page
						}
						else {																// if the user was deleted
							onlinelib.forcelogout(request, deleteduser);					// force a log out on the deleted user
							if (request.session.user.username === deleteduser.username) {	// if user self deleted
								response.redirect('/admin/selfdeleted');					// redirect to the self deleted page
							}
							else {													// if the user was not their self
								request.flash('title', 'user deleted');
								request.flash('user', deleteduser);					// flash the deleted user
								response.redirect('/admin/usercrud');				// redorect to the user crud page
							}
						}
					}
				)
			}
		);
	}
);

router.get('/usercrud',
	function (request, response) {
		onlinelib.requirelogin(request, response, adminrequired,					// require the user to be logged in
			function (request, response, user) {
				response.render('usercrud',											// render the user crud page
					{ title : request.flash('title'),
					username : request.flash('user').username,
					path : '/admin/online',
					delay : defaultdelay }
				);
			}
		);
	}
);

router.get('/selfdeleted',
	function (request, response) {
		response.render('selfdeleted',												// render the self deleted page
			{ title : 'self deleted',
			path : '/user/login', 
			delay : defaultdelay }
		);
	}
);

module.exports = router;