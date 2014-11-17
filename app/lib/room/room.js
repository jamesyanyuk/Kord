var pg = require('pg');
var connectionString = require('../db').connectionString;
var db = require('../db');
var Chat = require('../chat');
var user = require('../user');

exports.createRoom = createRoom;
exports.getRoomsFor = getRoomsFor;
exports.readRoom = readRoom;
exports.updateRoom = updateRoom;
exports.destroyRoom = destroyRoom;

function Room(roomID, url, password, chat) {
	this.roomID = roomID;
	this.url = url;
	this.password = password;
	this.chat = chat;
}

function createRoom(url, password, creatorID, callback) {
	pg.connect(connectionString,												// try to connect to the database
		function (error, database, done) {
			if (error) return callback(error);								// if there was an error, return it

			var chat = new Chat();												// create a new chat
			var data = [];														// create an empty array to store the query parameters
			data[data.length] = db.nextID('rooms', 'roomID');					// get the next id
			data[data.length] = url;											// use the url
			data[data.length] = password;										// use the password
			data[data.length] = chat;											// use the chat
			var querystring = db.insertInto('rooms', data, 'roomID');			// generate the query string

			db.query(database, done, querystring, false,						// query the database
				function (error, result) {
					if (error) return callback(error);							// if there was an error, return it

					var roomID = result[0]['roomid'];

					// console.log('roomID returned: ' + roomID);
					// console.log();

					data = [];
					data[data.length] = roomID;
					data[data.length] = creatorID;

					querystring = db.insertInto('rooms_moderators', data);
					db.query(database, done, querystring, false,				// insert into the rooms_moderators table the room : moderator mapping
						function (error, result) {
							if (error) return callback(error);
						}
					);

					querystring = db.insertInto('rooms_members', data);
					db.query(database, done, querystring, false,				// insert into the rooms_member table the room : member mapping
						function (error, result) {
							if (error) return callback(error);
						}
					);					

					db.createBoard(roomID,										// try to create a board
						function (error, board) {
							if (error) return destroyRoom(roomID, error, callback);	// if there was an error, destroy the room
							
							// console.log("board returned:");
							// for (var prop in board) {
							// 	console.log(prop + ": " + board[prop]);
							// }
							// console.log();

							// var moderatorIDs = [];								// create an empty array to store the moderators
							// var memberIDs = [];									// create an empty array to store the users
							// var boardIDs = [];									// create an empty array to store boards

							// moderatorIDs[moderatorIDs.length] = creatorID;		// add the creator to the list of moderators
							// memberIDs[memberIDs.length] = creatorID;					// add the creator to the list of members
							// boardIDs[boardIDs.length] = board.boardID;						// add the board to the list of boards

							var room = new Room(roomID, url, password, chat);
							return callback(undefined, room);					// return the room
						}
					);
				}
			);
		}
	);
}

function getRoomsFor(userID, callback) {
	pg.connect(connectionString,												// try to connect to the database
		function (error, database, done) {
			if (error) return callback(error);

			var columns = [];													// create an empty array to store columns
			columns[columns.length] = 'roomID';									// look for the roomID

			var querystring = db.selectFrom(columns,
				'rooms_members', 'memberID = ' + userID);	

			db.query(database, done, querystring, true,
				function (error, roomsJSON) {
					if (error) return callback(error);

					var rooms = [];
					var roomArray = JSON.parse(roomsJSON);
					return db.getObjects(readRoom, rooms, roomArray, 0, callback);
				}
			);
		}
	);
}

function readEntireRoom(roomID, callback) {
	// readRoom
	// readModerators
	// readMembers
	// readBoards
}

function readRoom(roomID, callback) {
	pg.connect(connectionString,												// try to connect to the database
		function (error, database, done) {
			if (error) return callback(error);									// if there was an error, return it

			var columns = [];
			columns[columns.length] = '*';
			var querystring = db.selectFrom(columns,							// select all columns from rooms where roomid = roomid
				'rooms', 'roomID = ' + roomID);

			db.query(database, done, querystring, false,						// query the database
				function (error, result) {
					if (error) return callback(error);							// if there was an error, return it
					if (!result.length) return callback('room does not exist');

					var roomID = result[0]['roomid'];
					var url = result[0]['url'];
					var password = result[0]['password'];
					var chat = result[0]['chat'];

					var room = new Room(roomID, url, password, chat);
					return callback(undefined, room);		
				}
			);
		}
	);
}

function updateRoom(roomID, room, callback) {

}

function destroyRoom(roomID, undo, callback) {
	pg.connect(connectionString,
		function (error, database, done) {
			if (error) return callback(error);

			db.deleteFrom('rooms', 'roomID = ' + roomID);
			db.query(database, done, querystring,
				function (error, result) {
					if (undo || error) return callback(undo || error);
					return callback(undefined, roomID);
				}
			);
		}
	);
}


// columns = [];
// columns[columns.length] = 'userID';
// querystring = db.selectFrom(columns,						// select userid from rooms_moderators where roomid = roomid
// 	'rooms_moderators', 'roomID = ' + roomID);
// db.query(database, done, querystring, false,				// query the database
// 	function (error, result) {
// 		if (error) return callback(error);					// if there was an error, return it

// 		// console.log('result returned:');
// 		// for (var prop in result[0]) {
// 		// 	console.log(prop + ': ' + result[0][prop]);
// 		// }
// 		// console.log();


// 		var moderatorIDs = [];
// 		for (var i = 0; i < result.length; i++ ) {
// 			moderatorIDs[moderatorIDs.length] = result[i]['userid'];
// 		}

// 		querystring = db.selectFrom(columns,				// select
// 			'rooms_members', 'roomID = ' + roomID);
// 		db.query(database, done, querystring, false,
// 			function (error, result) {
// 				if (error) return callback(error);

// 				// console.log('result returned:');
// 				// for (var prop in result) {
// 				// 	console.log(prop + ': ' + result[prop]);
// 				// }
// 				// console.log();

// 				var memberIDs = [];
// 				for (var i = 0; i < result.length; i++ ) {
// 					memberIDs[memberIDs.length] = result[i]['userid'];
// 				}

// 				columns = [];
// 				columns[columns.length] = 'boardID';
// 				querystring = db.selectFrom(columns,
// 					'rooms_boards', 'roomID = ' + roomID);
// 				db.query(database, done, querystring, false,
// 					function (error, result) {
// 						if (error) return callback(error);

// 						// console.log('result returned:');
// 						// for (var prop in result) {
// 						// 	console.log(prop + ': ' + result[prop]);
// 						// }
// 						// console.log();

// 						var boardIDs = [];
// 						for (var i = 0; i < result.length; i++) {
// 							boardIDs[boardIDs.length] = result[i]['boardid'];
// 						}