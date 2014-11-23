/**
 * @author Julian Kuk
 *
 * Serves primarly as an interface into the database / data structures.
 * */

var http = require('http');
var pg = require('pg');
var connectionString = 'postgres://cnlgnxpqpwvnss:7RWorNu7vA6VtCNH1d_B7Cip_A@ec2-184-73-229-220.compute-1.amazonaws.com:5432/d882b9an2oglco?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory';
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

exports.authenticate = authenticate;

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
exports.authenticateMember = room.authenticateMember;

// exports.createChat = chat.createChat;
// exports.readChat = chat.readChat;
exports.updateChatFor = chat.updateChatFor;
// exports.destroyChat = chat.destroyChat;

exports.createBoard = board.createBoard;
exports.readBoard = board.readBoard;
exports.readBoardsFor = board.readBoardsFor;
exports.updateBoard = board.updateBoard;
exports.destroyBoard = board.destroyBoard;

// exports.createCanvas = canvas.createCanvas;
// exports.readCanvas = canvas.readCanvas;
exports.updateCanvasFor = canvas.updateCanvasFor;
// exports.destroyCanvas = canvas.destroyCanvas;

exports.createResource = resource.createResource;
exports.readResource = resource.readResource;
exports.readResourcesFor = resource.readResourcesFor;
exports.updateResource = resource.updateResource;
exports.destroyResource = resource.destroyResource;

var ALL_COLUMNS = ['*'];
var ID = 'id';
var SUCCESS = undefined;
var DOES_NOT_EXIST = 'does not exist';
var INVALID = 'invalid';
exports.ALL_COLUMNS = ALL_COLUMNS;
exports.SUCCESS = SUCCESS;
exports.DOES_NOT_EXIST = DOES_NOT_EXIST;
exports.INVALID = INVALID;

/*
 * object CRUD functions
 * */

// create a new object in the database
function createObject(table, fields, returnField, callback) {
	pg.connect(connectionString,												// try to connect to the database
		function (error, database, done) {
			if (error) return callback(error);									// if there was an error, return it

			var querystring = insertInto(table, fields, returnField);			// generate the isnert query
			query(database, done, querystring,									// query the database
				function (error, result) {
					if (error) return callback(error);							// if there was an error, return it
					return callback(SUCCESS, result[0][ID]);					// otherwise, return the id of the object created
				}
			);
		}
	);
}

// associate two objects in the database with each other
function joinObjects(firstTable, secondTable, firstid, secondid, callback) {
	pg.connect(connectionString,												// try to connect to the database
		function (error, database, done) {
			if (error) return callback(error);									// if there was an error, return it

			var fields = [];													// create an empty array for storing ids
			fields[fields.length] = firstid;									// store the first id
			fields[fields.length] = secondid;									// store the second id

			var querystring = insertInto(										// generate the insert query
				joinTables(firstTable, secondTable), fields
			);
			query(database, done, querystring,									// query the database
				function (error, result) {
					if (error) return callback(error);							// if there was an error, return it
					return callback(SUCCESS, result);							// otherwise, return the result of the query
				}
			);
		}
	);
}

// read an object from the database
function readObject(table, column, field, callback) {
	pg.connect(connectionString,												// try to connect to the database
		function (error, database, done) {
			if (error) return callback(error);									// if there was an error, return it

			var querystring = selectFrom(										// generate the select query
				table, ALL_COLUMNS, map(column, field)
			);
			query(database, done, querystring,									// query the database
				function (error, result) {
					if (error) return callback(error);							// if there was an error, return it
					if (!result.length) return callback(DOES_NOT_EXIST);		// if there were no matches, return the error
					return callback(SUCCESS, result[0]);						// otherwise, return the result of the query
				}
			);
		}
	);
}

// read multiple objects from the database
function readObjects(column, objects, ids, read, callback) {
	readObjectsRecursive(column, objects, ids, 0, read,							// recursively read the objects
		function (error, result) {
			if (error) return callback(error);									// if there was an error, return it
			return callback(SUCCESS, result);									// otherwise, wreturn the result of the query
		}
	);
}

// read the objects recursively
function readObjectsRecursive(column, objects, ids, i, read, callback) {
	read(ids[i][column],														// get the object by its id
		function (error, result) {
			if (error) return callback(error);									// if there was an error, return it

			var object = result;
			objects[objects.length] = object;									// store the object in the array
			if (i == ids.length - 1) {											// if the end of the array has been reached
				return callback(SUCCESS, objects);								// return the objects
			}
			else {																// otherwise
				readObjectsRecursive(											// continue reading objects recursively
					column, objects, ids, i + 1, read, callback
				);
			}
		}
	);
}

// read the objects satisfying a given condition
function readObjectsFor(table, column, id, objectid, read, callback) {
	pg.connect(connectionString,												// try to connect to the database
		function (error, database, done) {
			if (error) return callback(error);									// if there was an error, return it

			var querystring = selectFrom(										// generate the read query string
				table, [column], map(id, objectid)
			);

			query(database, done, querystring,									// query the database
				function (error, result) {
					if (error) return callback(error);							// if there was an error, return it
					if (!result.length) return callback(DOES_NOT_EXIST);		// if no matches were found, return an error

					var ids = result;
					var objects = [];											// create an empty array to store objects
					readObjects(column, objects, ids, read,						// read the requested objects into arrays
						function (error, result) {
							if (error) return callback(error);					// if there was an error, return it
							return callback(SUCCESS, result);					// otherwise, return the result of the query
						}
					);
				}
			);
		}
	);
}

// update an object in the database
function updateObject(table, id, object, callback) {
	pg.connect(connectionString,												// try to connect to the database
		function (error, database, done) {
			if (error) return callback(error);									// if there was an error, return it

			var columns = [];													// create an empty array to store the columns that will be updated
			var fields = [];													// create an empty array to store the fields that the columns will take
			for (var property in object) {										// for each property of an object
				columns[columns.length] = property;								// save the column name
				fields[fields.length] = object[property];						// save the actual field value
			}

			var querystring = updateWhere(										// generate the update query string
				table, columns, fields, map(id, object[id])
			);
			query(database, done, querystring,									// query the database
				function (error, result) {
					if (error) return callback(error);							// if there was an error, return it
					return callback(SUCCESS, object);							// otherwise, return the object
				}
			);
		}
	);
}

// update a single field in the database
function updateField(table, column, field, id, objectid, callback) {
	pg.connect(connectionString,												// try to connect to the database
		function (error, database, done) {
			if (error) return callback(error);									// if there was an error, return it

			var querystring = updateWhere(										// generate the update query string
				table, [column], [field], map(id, objectid)
			);
			query(database, done, querystring,									// query the database
				function (error, result) {
					if (error) return callback(error);							// if there was an error, return it
					return callback(SUCCESS, result);							// otherwise, return the object
				}
			);
		}
	);
}

// destroy an object in the database
function destroyObject(table, id, objectid, callback) {
	pg.connect(connectionString,												// try to connect to the database
		function (error, database, done) {
			if (error) return callback(error);									// if there was an error, return it

			var querystring = deleteFrom(table, map(id, objectid));				// generate the delete query string
			query(database, done, querystring,									// query the database
				function (error, result) {
					if (error) return callback(error);							// if there was an error, return it
					return callback(SUCCESS, objectid);							// otherwise, return the id of the destroyed object
				}
			);
		}
	);
}


function selectFrom(table, columns, condition) {
	return 'SELECT ' + list(columns) + ' FROM ' + table + ' ' +
		'WHERE ' + condition + ';';
}

// authenticate a user
function authenticate(table, id, idcolumn, idfield, passcolumn, passfield, callback) {
	pg.connect(connectionString,												// try to connect to the database
		function (error, database, done) {
			if (error) return callback(error);									// if there was an error, return it

			var condition = map(idcolumn, idfield) + ' AND ' +
				map(passcolumn, passfield);
			var querystring = selectFrom(table, [id], condition);		// generate the select query string
			query(database, done, querystring,									// query the database
				function (error, result) {
					if (error) return callback(error);							// if there was an error, return it
					if (!result.length) return callback(SUCCESS, undefined);	// if no matches were found, return an error
					return callback(SUCCESS, result[0][id]);					// otherwise, return a success message
				}
			);
		}
	);
}

/*
 * actual query function
 * */

function query(database, done, querystring, callback) {
	database.query(querystring,													// query the database
		function (error, result) {
			console.log(querystring);
			done();																// signal that the query is done
			if (error) return callback(error);									// if there was an error, return it
			return callback(SUCCESS, result.rows);								// return the result
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
	return "nextval('" + table + "_" + id + "_seq')";
}

function values(fields) {
	var valuestring = 'VALUES (';
	for (var i = 0; i < fields.length - 1; i++) {
		valuestring += format(fields[i]) + ', ';
	}
	return valuestring + format(fields[i]) + ')';
}

function format(value) {
	if (typeof value == 'string' && !(value.indexOf('nextval') > -1)) {
		return "'" + value + "'";
	}
	else if (typeof value == 'object') {
		return "'" + JSON.stringify(value) + "'";
	}
	return value;
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
