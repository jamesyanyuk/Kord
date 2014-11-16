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
	return 'INSERT INTO ' + table + ' ' + values(data, id);						// create the INSERT query string
}

exports.selectFrom = function (columns, table, attribute, id) { 
	return 'SELECT ' + columns + ' FROM ' + table + ' ' + 'WHERE ' + attribute + ' = ' + id + ';';
}

exports.nextID = function(table, id) {											
	return "nextval('" + table + "_" + id + "_seq')";							// create a string to generate the next value
}																				// var string = "nextval(pg_get_serial_sequence('" + table + "', '" + id + "'))";

function values(data, id) {
	var valuestring = 'VALUES (';												// the values will be
	for (var i = 0; i < data.length - 1; i++) {									// for every attribute except the last
		valuestring += format(data[i]) + ', ';									// add the formatted data and a comma
	}
	return valuestring += format(data[i]) + returning(id);						// return the VALUES string with the last attribute appended and the RETURNING request
}

function format(value) {
	if (typeof value == 'number') {												// if the value is a number
		return value;															// return the number as is
	}
	else if (typeof value == 'string') {										// if the value is a string
		if (value.indexOf("nextval") > -1) {									// and the string is a nextval() function
			return value;														// return the value as is
		}
		else {																	// otherwise
			return "'" + value + "'";											// return the string surrounded by quotation marks
		}
	}
	else if (typeof value == 'object') {										// if the value is an object
		return "'" + JSON.stringify(value) + "'";								// return the object as a json
	}
}

function returning(id) {
	return ') RETURNING ' + id + ';';											// appending the RETURNING request
}

exports.createRoom = room.createRoom;
// exports.updateRoom = room.updateRoom;

// exports.createChat = chat.createChat;
// exports.updateChat = chat.updateChat;

exports.createBoard = board.createBoard;
// exports.updateBoard = board.updateBoard;

// exports.createCanvas = canvas.createCanvas;
// exports.updateCanvas = canvas.updateCanvas;