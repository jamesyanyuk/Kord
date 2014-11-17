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

exports.query = query;
exports.insertInto = insertInto;
exports.selectFrom = selectFrom;
// exports.update
exports.deleteFrom = deleteFrom;

exports.nextID = nextID;
exports.readObjects = readObjects;

exports.createRoom = room.createRoom;
exports.readRoom = room.readRoom;
// exports.updateRoom = room.updateRoom;

// exports.createChat = chat.createChat;
// exports.updateChat = chat.updateChat;

exports.createBoard = board.createBoard;
// exports.updateBoard = board.updateBoard;

// exports.createCanvas = canvas.createCanvas;
// exports.updateCanvas = canvas.updateCanvas;

function query(database, done, querystring, finished, callback) {
	database.query(querystring,													// query the database
		function (error, result) {
			console.log(querystring);
			if (finished) {
				done();																// signal that the query is done
				database.end();														// end the connection to the database
			}
			if (error) return callback(error);									// if there was an error, return it
			else {																// if there was no error
				callback(undefined, result.rows);						// return the id
			}
		}
	);
}

function insertInto(table, data, returnValue) {
	return 'INSERT INTO ' + table + ' ' + values(data) + returning(returnValue) + ';';	// create the INSERT query string
}

function selectFrom(columns, table, condition) { 					// change to handle multiple columns and attributes and data
	return 'SELECT ' + list(columns) + ' FROM ' + table + ' ' +
		'WHERE ' + condition + ';';
}

function deleteFrom(table, condition) {
	return 'DELETE FROM ' + table + ' WHERE ' + condition + ';';
}

function nextID(table, id) {											
	return "nextval('" + table + "_" + id + "_seq')";							// create a string to generate the next value
}																				// var string = "nextval(pg_get_serial_sequence('" + table + "', '" + id + "'))";

function readObjects(read, objectArray, objects, i, callback) {
	read(objectArray[i],														// get the object by its id
		function (error, object) {
			if (error) { return callback(error); }								// if there was an error, return it

			objects[objects.length] = object;									// store the object in the array
			if (i == objectArray.length - 1) {									// if at the end of the json
				return callback(undefined, objects);							// return the objects
			}
			else {																// otherwise
				readObjects(read, objects, objectArray, i + 1, callback);		// continue filling the array recursively
			}
		}
	);
}

function values(data) {
	var valuestring = 'VALUES (';												// the values will be
	for (var i = 0; i < data.length - 1; i++) {									// for every attribute except the last
		valuestring += format(data[i]) + ', ';									// add the formatted data and a comma
	}
	return valuestring + format(data[i]) + ')';
}

function format(value) {
	if (typeof value == 'string' && !(value.indexOf('nextval') > -1)) {			// if the value is a string
		return "'" + value + "'";												// return the string surrounded by quotation marks
	}
	else if (typeof value == 'object') {										// if the value is an object
		return "'" + JSON.stringify(value) + "'";								// return the object as a json
	}
	return value;																// if the value is anything, just return it
}

function returning(returnValue) {
	if (returnValue) {
		return ' RETURNING ' + returnValue;
	}
	return '';
}

function list(data) {
	var liststring = '';
	for (var i = 0; i < data.length - 1; i++) {
		liststring += data[i] + ', ';
	}
	return liststring + data[i];
}