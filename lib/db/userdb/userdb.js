var db = require('../db');

exports.create = function (userid) {
	return new User(userid);
};

exports.createUser = createUser;
exports.readUser = readUser;
exports.updateUser = updateUser;
exports.destroyUser = destroyUser;
exports.authenticateUser = authenticateUser;

var TABLE = 'users';
var ID = 'userid';

exports.TABLE = TABLE;
exports.ID = ID;

function User(userid, email, userpass, nickname, access) {
	this.userid = userid;
	this.email = email;
	this.userpass = userpass;
	this.nickname = nickname;
	this.access = access;
}

function defaultname(email) {
	var index = email.indexOf("@");
	if (index < 0) return email;
	return email.slice(0, index);
}

function createUser(email, userpass, access, callback) {
	var fields = [];
	fields[fields.length] = db.nextID(TABLE, ID);
	fields[fields.length] = email;
	fields[fields.length] = userpass;
	var nickname = defaultname(email);
	fields[fields.length] = nickname;
	fields[fields.length] = access;
	db.createObject(TABLE, fields, ID,
		function (error, result) {
			if (error) return callback(error);

			var userid = result;
			var user = new User(userid, email, userpass, nickname, access);
			return callback(db.SUCCESS, user);
		}
	);
}

function readUser(userid, callback) {
	db.readObject(TABLE, ID, userid,
		function (error, result) {
			if (error) return callback(error);

			var email = result['email'];
			var userpass = result['userpass'];
			var nickname = result['nickname'];
			var access = result['access'];
			console.log(access);
			var user = new User(userid, email, userpass, nickname, access);
			return callback(db.SUCCESS, user);
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

function authenticateUser(email, userpass, callback) {
	db.authenticate(TABLE, ID, 'email', email, 'userpass', userpass,
		function (error, result) {
			if (error) return callback(error);
			readUser(result,
				function (error, result) {
					return callback(db.SUCCESS, result);
				}
			);
		}
	);
}
