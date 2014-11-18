var pg = require('pg');
var connectionString = require('../db').connectionString;
var db = require('../db');

exports.create = function (userid) {
	return new User(userid);
};

function User(userid) {
	this.userid = userid;
	this.username = undefined;
	this.userpass = undefined;
	this.access = undefined;
}