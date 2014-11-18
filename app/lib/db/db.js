/**
 * @author Julian Kuk
 *
 * This file serves primarly as an interface into the database / fields structure functions.
 * */

var http = require('http');
var pg = require('pg');
var connectionString = 'postgres://student:student@localhost/student';
exports.connectionString = connectionString;

var room = require('./roomdb');
var chat = require('./chatdb');
var board = require('./boarddb');
var canvas = require('./canvasdb');
var resource = require('./resourcedb');

exports.query = query;
exports.insertInto = insertInto;
exports.selectFrom = selectFrom;
exports.updateWhere = updateWhere;
exports.deleteFrom = deleteFrom;

exports.nextID = nextID;

exports.readObject = readObject;
exports.readObjects = readObjects;
exports.readObjectsFor = readObjectsFor;
exports.updateObject = updateObject;
exports.destroyObject = destroyObject;

exports.createRoom = room.createRoom;
exports.readRoom = room.readRoom;
exports.readRoomsFor = room.readRoomsFor;
exports.updateRoom = room.updateRoom;
exports.destroyRoom = room.destroyRoom;

// exports.createChat = chat.createChat;
// exports.updateChat = chat.updateChat;

exports.createBoard = board.createBoard;
exports.readBoard = board.readBoard;
// exports.updateBoard = board.updateBoard;

// exports.createCanvas = canvas.createCanvas;
// exports.updateCanvas = canvas.updateCanvas;

/*
 * actual query function
 * */

function query(database, done, querystring, callback) {
	database.query(querystring,													// query the database
		function (error, result) {
			console.log(querystring);
			done();																// signal that the query is done
			if (error) return callback(error);									// if there was an error, return it
			return callback(undefined, result.rows);							// return the result
		}
	);
}

/*
 * basic CRUD queries
 * */

function insertInto(table, fields, returnValue) {
	return 'INSERT INTO ' + table + ' ' + values(fields) +
		returning(returnValue) + ';';
}

function selectFrom(columns, table, condition) {
	return 'SELECT ' + list(columns) + ' FROM ' + table + ' ' +
		'WHERE ' + condition + ';';
}

function updateWhere(table, columns, fields, condition) {
	return 'UPDATE ' + table + ' SET ' + list(mapAll(columns, fields)) +
		' WHERE ' + condition + ';';
}

function deleteFrom(table, condition) {
	return 'DELETE FROM ' + table + ' WHERE ' + condition + ';';
}

/*
 * query helper functions
 * */

function nextID(table, id) {											
	return "nextval('" + table + "_" + id + "_seq')";							// create a string to generate the next value
}

function values(fields) {
	var valuestring = 'VALUES (';												// the values will be
	for (var i = 0; i < fields.length - 1; i++) {									// for every attribute except the last
		valuestring += format(fields[i]) + ', ';									// add the formatted fields and a comma
	}
	return valuestring + format(fields[i]) + ')';
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

function list(fields) {
	var liststring = '';
	for (var i = 0; i < fields.length - 1; i++) {
		liststring += fields[i] + ', ';
	}
	return liststring + fields[i];
}

function mapAll(columns, fields) {
	var mapping = [];
	for (var i = 0; i < columns.length; i++) {
		mapping[i] = map(columns[i], fields[i]);
	}
	return mapping;
}

function map(column, field) {
	return column + ' = ' + format(field);
}

/*
 * object CRUD functions
 * */

function readObject(table, objectid, id, callback) {
	pg.connect(connectionString,												// try to connect to the database
		function (error, database, done) {
			if (error) return callback(error);									// if there was an error, return it

			var columns = [];
			columns[columns.length] = '*';
			var querystring = selectFrom(columns,							// select all columns from rooms where roomid = roomid
				table, map(objectid, id));

			query(database, done, querystring,								// query the database
				function (error, result) {
					if (error) return callback(error);							// if there was an error, return it
					if (!result.length) return callback('does not exist');		// if there were no matches, return the error
					return callback(undefined, result[0]);							// return the new room
				}
			);
		}
	);
}

function readObjects(read, column, objects, ids, callback) {
	readObjectsRecursive(read, column, objects, ids, 0,
		function (error, result) {
			if (error) return callback(error);
			return callback(undefined, result);
		}
	);
}

function readObjectsRecursive(read, column, objects, ids, i, callback) {
	read(ids[i][column],														// get the object by its id
		function (error, object) {
			if (error) return callback(error);									// if there was an error, return it

			objects[objects.length] = object;									// store the object in the array
			if (i == ids.length - 1) {
				return callback(undefined, objects);							// return the objects
			}
			else {																// otherwise
				readObjectsRecursive(read, column,								// continue filling the array recursively
					objects, ids, i + 1, callback);
			}
		}
	);
}

function readObjectsFor(read, table, column, objectid, id, callback) {
	pg.connect(connectionString,												// try to connect to the database
		function (error, database, done) {
			if (error) return callback(error);

			var querystring = selectFrom([column],
				table, map(objectid, id));	

			query(database, done, querystring,
				function (error, ids) {
					if (error) return callback(error);

					for (var prop in ids) {

						console.log(prop + ': ' + ids[prop]);
						for (var property in ids[prop]) {
							console.log(property + ': '+ ids[prop][property]);
						}
					}

					var objects = [];
					readObjects(read, column, objects, ids,
						function (error, result) {
							if (error) return callback(error);
							return callback(undefined, result);
						}
					);
				}
			);
		}
	);
}

function updateObject(object, table, id, callback) {
	pg.connect(connectionString,
		function (error, database, done) {
			if (error) return callback(error);

			var columns = [];
			var fields = [];

			for (var property in object) {
				columns[columns.length] = property;			
				fields[fields.length] = object[property];
			}
			var querystring = updateWhere(table,
				columns, fields, map(id, object[id])
			);

			query(database, done, querystring,
				function (error, result) {
					if (error) return callback(error);

					return callback(undefined, object);
				}
			);
		}
	);
}

function destroyObject(table, objectid, id, callback) {
	pg.connect(connectionString,
		function (error, database, done) {
			if (error) return callback(error);

			var querystring = deleteFrom(table, map(objectid, id));
			query(database, done, querystring,
				function (error, result) {
					if (error) return callback(error);
					return callback(undefined, id);
				}
			);
		}
	);
}