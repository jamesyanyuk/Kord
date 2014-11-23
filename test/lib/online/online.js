var online = {};															// the list of online users
exports.online = online;

function loggedin(request) {
	var user = request.session.user;										// get the user session
	if (user && online[user.userid]) {										// if the user is logged in
		return user;														// return the user
	}
	else {																	// if the user is not logged in
		request.session.user = undefined;									// make sure the user session is undefined
		return undefined;													// return false
	}
}
exports.loggedin = loggedin;

exports.requirelogin = function (request, response, adminrequired, action) {
	var user = loggedin(request);											// get the logged in user
	if (user) {																// if the user is logged in
		if (!adminrequired || (adminrequired && user.isadmin)) {			// if admin is not required or it is and the user is an admin
			return action(request, response, user);							// execute the requested action
		}
		else {
			request.flash('error', 'requires admin access');				// flash a message saying the user requires admin access
			return response.redirect('/user/main');							// redirect to the user main page
		}
	}
	else {																	// if the user is not logged in
		request.flash('error', 'must be logged in');						// flash a message saying the user must be logged in
		return response.redirect('/user/login');							// redirect to the login page
	}
}

exports.login = function (request, user) {
	request.session.user = user;											// set the user session
	online[user.userid] = user;												// add the user to the list of online users
}

exports.logout = function (request) {
	var user = request.session.user;										// get the user session
	if (user) {																// if the user is logged in
		delete online[user.userid];											// remove the user from the list of online users
		delete request.session.user;										// delete the user session
	}
}

exports.forcelogout = function (request, forceduser) {
	var user = request.session.user;										// get the user session
	if (user) {																// if the user is logged in
		delete online[forceduser.userid];									// remove the user from the list of online users
		if (user === forceduser) {											// if the user self deleted
			delete request.session.user;									// delete the user session
		}
	}
}