/**
 * @author Julian Kuk
 *
 * This file serves primarly as an interface into the database / fields structure functions.
 * */

var http = require('http');
var pg = require('pg');
var connectionString = 'postgres://student:student@localhost/student';
exports.connectionString = connectionString;

var user = require('./userdb');
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

exports.createObject = createObject;
exports.joinObjects = joinObjects;
exports.readObject = readObject;
exports.readObjects = readObjects;
exports.readObjectsFor = readObjectsFor;
exports.updateObject = updateObject;
exports.destroyObject = destroyObject;

exports.createUser = user.createUser;
exports.readUser = user.readUser;
exports.readModeratorsFor = user.readModeratorsFor;
exports.readMembersFor = user.readMembersFor;
exports.updateUser = user.updateUser;
exports.destroyUser = user.destroyUser;
exports.authenticateUser = user.authenticateUser;

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
// exports.destroyBoard = board.destroyBoard;

// exports.createCanvas = canvas.createCanvas;
// exports.readCanvas = canvas.readCanvas;
// exports.updateCanvas = canvas.updateCanvas;
// exports.destroyCanvas = canvas.destroyCanvas;

// exports.createResource = resource.createResource;
// exports.readResource = resource.readResource;
// exports.updateResource = resource.updateResource;
// exports.destroyResource = resource.destroyResource;

var ALL_COLUMNS = ['*'];
var ID = 'id';
var DOES_NOT_EXIST = 'does not exist';
var SUCCESS = undefined;
exports.ALL_COLUMNS = ALL_COLUMNS;
exports.DOES_NOT_EXIST = DOES_NOT_EXIST;
exports.SUCCESS = SUCCESS;

/*
 * actual query function
 * */

function query(database, done, querystring, callback) {
	database.query(querystring,													// query the database
		function (error, result) {
			console.log(querystring);
			done();																// signal that the query is done
			if (error) return callback(error);									// if there was an error, return it
			return callback(SUCCESS, result.rows);							// return the result
		}
	);
}

/*
 * basic CRUD queries
 * */

function insertInto(table, fields, returnField) {
	return 'INSERT INTO ' + table + ' ' + values(fields) +
		returning(returnField) + ';';
}

function selectFrom(table, columns, condition) {
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

function returning(returnField) {
	if (returnField) {
		return ' RETURNING ' + returnField + ' AS id';
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

function joinTables(first, second) {
	return first + '_' + second;
}

/*
 * object CRUD functions
 * */

function createObject(table, fields, returnField, callback) {
	pg.connect(connectionString,												// try to connect to the database
		function (error, database, done) {
			if (error) return callback(error);									// if there was an error, return it

			var querystring = insertInto(table, fields, returnField);				// generate the query string
			query(database, done, querystring,								// query the database
				function (error, result) {
					if (error) return callback(error);							// if there was an error, return it
					return callback(SUCCESS, result[0][ID]);
				}
			);
		}
	);
}

function joinObjects(firstTable, secondTable, firstid, secondid, callback) {
	pg.connect(connectionString,
		function (error, database, done) {
			if (error) return callback(error);

			var fields = [];
			fields[fields.length] = firstid;
			fields[fields.length] = secondid;

			var querystring = insertInto(
				joinTables(firstTable, secondTable), fields
			);
			query(database, done, querystring,
				function (error, result) {
					if (error) return callback(error);
					return callback(SUCCESS, result);
				}
			);
		}
	);
}

function readObject(table, column, field, callback) {
	pg.connect(connectionString,												// try to connect to the database
		function (error, database, done) {
			if (error) return callback(error);									// if there was an error, return it

			var querystring = selectFrom(
				table, ALL_COLUMNS, map(column, field)
			);																	// select all columns from rooms where roomid = roomid
			query(database, done, querystring,								// query the database
				function (error, result) {
					if (error) return callback(error);							// if there was an error, return it
					if (!result.length) return callback(DOES_NOT_EXIST);		// if there were no matches, return the error
					return callback(SUCCESS, result[0]);							// return the new room
				}
			);
		}
	);
}

function readObjects(column, objects, ids, read, callback) {
	readObjectsRecursive(column, objects, ids, 0, read,
		function (error, result) {
			if (error) return callback(error);
			return callback(SUCCESS, result);
		}
	);
}

function readObjectsRecursive(column, objects, ids, i, read, callback) {
	read(ids[i][column],														// get the object by its id
		function (error, object) {
			if (error) return callback(error);									// if there was an error, return it

			objects[objects.length] = object;									// store the object in the array
			if (i == ids.length - 1) {
				return callback(SUCCESS, objects);								// return the objects
			}
			else {																// otherwise
				readObjectsRecursive(
					column, objects, ids, i + 1, read, callback
				);				// continue filling the array recursively
			}
		}
	);
}

function readObjectsFor(table, column, id, objectid, read, callback) {
	pg.connect(connectionString,												// try to connect to the database
		function (error, database, done) {
			if (error) return callback(error);

			var querystring = selectFrom(
				table, [column], map(id, objectid)
			);	

			query(database, done, querystring,
				function (error, result) {
					if (error) return callback(error);
					if (!result.length) return callback(DOES_NOT_EXIST);
					var ids = result;
					var objects = [];
					readObjects(column, objects, ids, read,
						function (error, result) {
							if (error) return callback(error);
							return callback(SUCCESS, result);
						}
					);
				}
			);
		}
	);
}

function updateObject(table, id, object, callback) {
	pg.connect(connectionString,
		function (error, database, done) {
			if (error) return callback(error);

			var columns = [];
			var fields = [];
			for (var property in object) {
				columns[columns.length] = property;			
				fields[fields.length] = object[property];
			}

			var querystring = updateWhere(
				table, columns, fields, map(id, object[id])
			);
			query(database, done, querystring,
				function (error, result) {
					if (error) return callback(error);

					return callback(SUCCESS, object);
				}
			);
		}
	);
}

function updateField(table, column, field, id, objectid, callback) {
	pg.connect(connectionString,
		function (error, database, done) {
			if (error) return callback(error);

			var querystring = updateWhere(
				table, [column], [field], map(id, objectid)
			);
			query(database, done, querystring,
				function (error, result) {
					if (error) return callback(error);

					return callback(SUCCESS, object);
				}
			);
		}
	);
}

function destroyObject(table, id, objectid, callback) {
	pg.connect(connectionString,
		function (error, database, done) {
			if (error) return callback(error);

			var querystring = deleteFrom(table, map(id, objectid));
			query(database, done, querystring,
				function (error, result) {
					if (error) return callback(error);
					return callback(SUCCESS, objectid);
				}
			);
		}
	);
}