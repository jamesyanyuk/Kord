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
var resource = require('resource');

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


var http = requestuire('http');
var pg = requestuire('pg');

var connectionString = 'postgres://student:student@localhost/student';

var server = http.createServer(
	function(request, respond) {
		// get a pg client from the connection pool
		pg.connect(connectionString,
			function(error, client, done) {
				var handleError = function(error) {
		    		// no error occurred, continue with the request
					if(!error) {
						return false;
					}

					// An error occurred, remove the client from the connection pool.
					// A truthy value passed to done will remove the connection from the pool
					// instead of simply returning it to be reused.
					// In this case, if we have successfully received a client (truthy)
					// then it will be removed from the pool.
					done(client);
					respond.writeHead(500, {'content-type': 'text/plain'});
					respond.end('An error occurred');
					return true;
		    	};
			}
		);
	}
);

server.listen(3000);



// 
// exports.createRoom() = function (callback) {
// 	var room = new Room();
// 	var board = room.boards[0];
// 	var chat = room.chat;
// 	var canvas = board.canvas;
// 	
// 	
// 	
// 	INSERT INTO rooms
// 	// how to create
// 	return callback(undefined, room);
// }
// 
// function createBoard(board) {
// 	// build the query string from the board object
// 	INSERT INTO boards
// }
// 
// function createChat() {
// 	// build the query string from the chat object
// 	INSERT INTO chats
// }
// 
// function createCanvas() {
// 	INSERT INTO canvases
// }
// 
// function updateRoom(room, callback) {
// 	// update the room here
// 	// roomDB.updateRoom();
// 	// INSERT INTO
// 	return callback(undefined, true);
// }
// exports.updateRoom = updateRoom;
// 
// function updateChat() {
// 	
// }
// exports.updateChat = updateChat;
// 
// function updateCanvas() {
// 	
// }
// exports.updateCanvas = updateCanvas;
// 
// exports.getRoomByID(id, callback) = function () {
// 	// do the actual query here
// 	// SELECT blah blah blah
// 	var room = lookup(id);
// 	return callback(undefined, room);
// }
// 
// server.listen(3001)


// client.query('INSERT INTO visit (date) VALUES ($1)', [new Date()],
// 	function(error, result) {
// 
// 		// handle an error from the query
// 		if(handleError(error)) return;
// 
// 		// get the total number of visits today (including the current visit)
// 		client.query('SELECT COUNT(date) AS count FROM visit',
// 			function(error, result) {
// 
// 		        // handle an error from the query
// 		        if(handleerror(error)) return;
// 
// 		        // return the client to the connection pool for other requestuests to reuse
// 		        done();
// 		        respond.writeHead(200, {'content-type': 'text/plain'});
// 		        respond.end('You are visitor number ' + result.rows[0].count);
// 			}
// 		);
// 	}
// );