/**
 * @author Julian Kuk
 *
 * This file serves primarly as an interface into the database / data structure functions.
 * */

var http = require('http');
var pg = require('pg');
var connectionString = 'postgres://student:student@localhost/student';
exports.connectionString = connectionString;

var room = require('../room');
var chat = require('../chat');
var board = require('../board');
var canvas = require('../canvas');
var resource = require('../resource');

exports.query = function (database, done, querystring, requestingid, callback) {
	database.query(querystring,													// query the database
		function (error, result) {
			done();																// signal that the query is done
			database.end();														// end the connection to the database
			if (error) { return callback(error); }								// if there was an error, return it

			else {																// if there was no error
				if (requestingid) {												// if the caller is requesting an id
					callback(undefined, result.rows[0]);						// return the id
				}
				else {
					callback(undefined, result.rows);							// return the result
				}
			}
		}
	);
}

exports.insertInto = function (table, data, id) {
	return 'INSERT INTO ' + table + ' ' + values(data, id);
}

exports.nextID = function(table, id) {
	// var string = "nextval(pg_get_serial_sequence('" + table + "', '" + id + "'))";
	return "nextval('" + table + "_" + id + "_seq')";
}

function values(data, id) {
	var valuestring = 'VALUES (';
	for (var i = 0; i < data.length - 1; i++) {
		valuestring += format(data[i]) + ', ';
	}
	return valuestring += format(data[i]) + returning(id);
}

function format(value) {
	if (typeof value == 'number') {
		return value;
	}
	else if (typeof value == 'string') {
		if (value.indexOf("nextval") > -1) {
			return value;
		}
			return "'" + value + "'";
	}
	else if (typeof value == 'object') {
		return "'" + JSON.stringify(value) + "'";
	}
}

function returning(id) {
	return ') RETURNING ' + id + ';';
}

exports.createRoom = room.createRoom;
// exports.updateRoom = room.updateRoom;

// exports.createChat = chat.createChat;
// exports.updateChat = chat.updateChat;

exports.createBoard = board.createBoard;
// exports.updateBoard = board.updateBoard;

// exports.createCanvas = canvas.createCanvas;
// exports.updateCanvas = canvas.updateCanvas;