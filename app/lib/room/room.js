var pg = require('pg');
var connectionString = require('../db').connectionString;
var db = require('../db');
var Chat = require('../chat');

function Room(roomID, url, password, chat, boards, moderators, members) {
	this.roomID = roomID;
	this.url = url;
	this.password = password;
	this.chat = chat;
	this.boards = boards;
	this.moderators = moderators;
	this.members = members;
}

function createRoom(url, password, creator, callback) {
	pg.connect(connectionString,												// try to connect to the database
		function (error, database, done) {
			if (error) { return callback(error); }								// if there was an error, return it

			db.createBoard(														// try to create a board
				function (error, board) {
					if (error) { return callback(error); }						// if there was an error, return it
					
					console.log('board created: ' + board);

					var chat = new Chat();										// create a new chat
					var data = [];												// create an empty array to store the query parameters
					data[data.length] = db.nextID('rooms', 'roomID');			// get the next id
					data[data.length] = url;									// use the url
					data[data.length] = password;								// use the password
					data[data.length] = chat;									// use the chat
					var querystring = db.insertInto('rooms', data, 'roomID');	// generate the query string

					db.query(database, done, querystring, true,					// query the database
						function (error, roomID) {
							if (error) { return callback(error); }				// if there was an error, return it

							var boards = [];									// create an empty array to store boards
							var moderators = [];								// create an empty array to store the moderators
							var members = [];									// create an empty array to store the users

							boards[boards.length] = board;						// add the board to the list of boards
							moderators[moderators.length] = creator;			// add the creator to the list of moderators
							members[members.length] = creator;					// add the creator to the list of members

							var room = new Room(roomID, url, password, chat,	// create a new room
								boards, moderators, members);
							return callback(undefined, room);					// return the room

							// INSERT INTO rooms_boards
							// INSERT INTO rooms_members
							// INSERT INTO rooms_moderators
						}
					);
				}
			);
		}
	);
}

function readRoom(callback) {
	pg.connect(connectionString,
		function (error, database, done) {
			if (error) { return callback(error); }

			var querystring = db.selectFrom('*', 'rooms', 'roomID', roomID);
			db.query(database, done, querystring, false,
				function (error, roomJSON) {
					if (error) { return callback(error); }

					var room = JSON.parse(roomJSON);

					db.query(database, done, querystring, false,
						function(error, boardsJSON) {

							db.query(database, done, querystring, false,
								function (error, moderatorsJSON) {

									db.query(database, done, querystring, false,
										function (error, membersJSON) {

										}
									);

								}
							);

						}

					return callback(undefined, room);
					);
				}
			);
		}
	);
}

function updateRoom() {

}

function destroyRoom() {

}

exports.createRoom = createRoom;
exports.readRoom = readRoom;
exports.updateRoom = updateRoom;
exports.destroyRoom = destroyRoom;
// 
// 
// function updateRoom(room, callback) {
// 	// update the room here
// 	// roomDB.updateRoom();
// 	// INSERT INTO
// 	return callback(undefined, true);
// }
// 
// exports.getRoomByID(id, callback) = function () {
// 	// do the actual query here
// 	// SELECT blah blah blah
// 	
// 	var room = query();
// 	return callback(undefined, room);
// }

// add function for creating room here
// add functions for updating specific fields here