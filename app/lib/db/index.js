/**
 * @author Julian Kuk
 *
 * This file serves primarly as an interface into the database / data structure functions.
 * */

var pg = require('pg');
var connectionstring = 'postgres://student:student@localhost/student';
var room = require('room');
var chat = require('chat');
var board = require('board');
var canvas = require('canvas');
// var resource = require('resource');

exports.query = function (database, done, querystring, callback) {
	database.query(querystring,											// query the database
		function (error, result) {										// use a callback function
			done();														// signal that the query is done
			database.end();												// end the connection to the database
			if (error) {												// if there is an error
				callback(error);										// return the error to the calling function
			}
			else {														// otherwise
				callback(undefined, result.rows);						// return the data to the calling function
			}
		}
	);
}

exports.createRoom = room.createRoom;
exports.updateRoom = room.updateRoom;

// exports.createChat = chat.createChat;
// exports.updateChat = chat.updateChat;

exports.createBoard = board.createBoard;
// exports.updateBoard = board.updateBoard;

// exports.createCanvas = canvas.createCanvas;
// exports.updateCanvas = canvas.updateCanvas;
