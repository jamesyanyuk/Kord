function User(username, password, userid, isadmin) {						// the user object
    this.username = username;
	this.password = password;
	this.userid = userid;
	this.isadmin = isadmin;
}

var users = [];																// the user database
exports.users = users;

exports.admins = function (callback) {
	var adminlist = [];														// create an empty admin list
	for (var userid in users) {												// for every user
		var user = users[userid];											// get the user
		if (user && user.isadmin) {											// if the user is an admin
			adminlist[adminlist.length] = user;								// add the user to the admin list
		}
	}
	return callback(adminlist);												// return the admin list
}

function admincount() {
	var admincounter = 0;													// initialize the admin counter to 0
	for (var userid in users) {												// for every user
		var user = users[userid];											// get the user
		if (user && user.isadmin) {											// if the user is an admin
			admincounter++;													// increment the admin counter
		}
	}
	return admincounter;													// return the admin counter
}

function finduser(username) {
	for (var userid in users) {												// for every user
		var user = users[userid];											// get the user
		if (user && user.username === username) {							// if the usernames match
			return user;													// return the user
		}
	}
	return undefined;														// otherwise, there was no match so return undefined
}

exports.authenticate = function (username, password, callback) {
	var user = finduser(username);											// find the user
	if (user) {																// if the user exists
		if (user.password === password) {									// and the passwords match
			return callback(undefined, user);								// return the user
		}
		else {																// if the passwords don't match
			return callback('incorrect password');							// return an error message
		}
	}																		// if the user does not exist
	return callback('user not found');										// return an error message
};

exports.createuser = function (username, password, isadmin, callback) {
	if (finduser(username)) {												// if the user exists
		return callback('username already taken');							// return an error message
	}
	var user = new User(username, password, idcounter++, isadmin);			// create a new user
	users[user.userid] = user;												// store it in the database
	return callback(undefined, user);										// return the user
}

exports.deleteuser = function (username, callback) {
	var user = finduser(username);											// find the user
	if (user) {																// if the user exists
		if (user.isadmin && admincount() <= 1) {							// if the user is an admin and there are 0 or 1 admins
			return callback('must have at least one admin');				// return an error message
		}
		else {																// otherwise
			delete users[user.userid];										// delete the user from the database
			return callback(undefined, user);								// return the user
		}
	}																		// if the user does not exist
	return callback('user not found');										// return an error message
}

// setting up a default userbase
// there must be at least one user

var idcounter = 0;
var user = new User('admin', '', idcounter++, true);
users[user.userid] = user;

var user = new User('a', '', idcounter++, true);
users[user.userid] = user;

var user = new User('b', '', idcounter++, false);
users[user.userid] = user;

var user = new User('c', '', idcounter++, false);
users[user.userid] = user;

var user = new User('d', '', idcounter++, false);
users[user.userid] = user;