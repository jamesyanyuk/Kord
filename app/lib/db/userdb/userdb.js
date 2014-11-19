var db = require('../db');

exports.create = function (userid) {
	return new User(userid);
};

exports.createUser = createUser;
exports.readUser = readUser;
exports.readModeratorsFor = readModeratorsFor;
exports.readMembersFor = readMembersFor;
exports.updateUser = updateUser;
exports.destroyUser = destroyUser;
exports.authenticateUser = authenticateUser;

var TABLE = 'users';
var ID = 'userid';

function User(userid, username, userpass, access) {
	this.userid = userid;
	this.username = username;
	this.userpass = userpass;
	this.access = access;
}

function createUser(username, userpass, access, callback) {
	var fields = [];
	fields[fields.length] = db.nextID(TABLE, ID);
	fields[fields.length] = username;
	fields[fields.length] = userpass;
	fields[fields.length] = access;
	db.createObject(TABLE, fields, ID,
		function (error, result) {
			if (error) return callback(error);

			var userid = result;
			var user = new User(userid, username, userpass, access);
			return callback(db.SUCCESS, user);
		}
	);
}

function readUser(userid, callback) {
	db.readObject(TABLE, ID, userid,
		function (error, result) {
			if (error) return callback(error);

			var username = result['username'];
			var userpass = result['userpass'];
			var access = result['access'];
			var user = new User(userid, username, userpass, access);
			return callback(db.SUCCESS, user);
		}
	);
}

function readModeratorsFor(roomid, callback) {
	db.readObjectsFor('rooms_moderators', ID, 'roomid', roomid, readUser,
		function (error, result) {
			if (error) return callback(error);
			return callback(db.SUCCESS, result);
		}
	);
}

function readMembersFor(roomid, callback) {
	db.readObjectsFor('rooms_members', ID, 'roomid', roomid, readUser,
		function (error, result) {
			if (error) return callback(error);
			return callback(db.SUCCESS, result);
		}
	);
}

function updateUser(user, callback) {
	db.updateObject(TABLE, ID, user,
		function (error, result) {
			if (error) return callback(error);
			return callback(db.SUCCESS, result);
		}
	);
}

function destroyUser(userid, callback) {
	db.destroyObject(TABLE, ID, userid,
		function (error, result) {
			if (error) return callback(error);
			return callback(db.SUCCESS, result);
		}
	);
}

function authenticateUser(username, userpass, callback) {
	// db.findObject
}