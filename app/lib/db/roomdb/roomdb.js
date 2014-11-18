var pg = require('pg');
var connectionString = require('../db').connectionString;
var db = require('../db');
var dbchat = require('../chatdb');
var dbuser = require('../userdb');

exports.create = function (roomid, url, roompass, chat) {
	return new Room(roomid, url, roompass, chat);
};

exports.createRoom = createRoom;
exports.readRoom = readRoom;
exports.updateRoom = updateRoom;
exports.destroyRoom = destroyRoom;

exports.readRoomsFor = readRoomsFor;
exports.readEntireRoom = readEntireRoom;

var ROOMS = 'rooms';
var ROOM_ID = 'roomid';
var ROOMS_MODERATORS = 'rooms_moderators';
var ROOMS_MEMBERS = 'rooms_members';
var MEMBER_ID = 'memberid';
var ALL = '*';
var URL = 'url';
var ROOMPASS = 'roompass';
var DOES_NOT_EXIST = 'does not exist';
var SUCCESS = undefined;


function Room(roomid, url, roompass, chat) {
	this.roomid = roomid;
	this.url = url;
	this.roompass = roompass;
	this.chat = chat;
}

function createRoom(url, roompass, creatorid, callback) {
	pg.connect(connectionString,												// try to connect to the database
		function (error, database, done) {
			if (error) return callback(error);									// if there was an error, return it

			var chat = dbchat.Chat();												// create a new chat
			var data = [];														// create an empty array to store the query parameters
			data[data.length] = db.nextID('rooms', 'roomid');					// the next id
			data[data.length] = url;											// the url
			data[data.length] = roompass;										// the roompass
			data[data.length] = chat;											// the chat
			var querystring = db.insertInto('rooms', data, 'roomid');			// generate the query string

			db.query(database, done, querystring,								// query the database
				function (error, result) {
					if (error) return callback(error);							// if there was an error, return it

					var roomid = result[0]['roomid'];

					data = [];
					data[data.length] = roomid;
					data[data.length] = creatorid;

					console.log('creator id: ' + creatorid);

					querystring = db.insertInto('rooms_moderators', data);
					db.query(database, done, querystring,						// insert into the rooms_moderators table the room : moderator mapping
						function (error, result) {
							if (error) return callback(error);
						}
					);

					querystring = db.insertInto('rooms_members', data);
					db.query(database, done, querystring,						// insert into the rooms_member table the room : member mapping
						function (error, result) {
							if (error) return callback(error);
						}
					);					

					db.createBoard(roomid,										// try to create a board
						function (error, board) {
							if (error) {
								return uncreateRoom(roomid, error, callback);	// if there was an error, uncreate the room and callback
							}

							var room = new Room(roomid, url, roompass, chat);
							return callback(undefined, room);					// return the room
						}
					);
				}
			);
		}
	);
}

function readRoom(roomid, callback) {
	db.readObject('rooms', 'roomid', roomid,
		function (error, result) {
			if (error) return callback(error);

			var url = result['url'];
			var roompass = result['roompass'];
			var chat = result['chat'];
			var room = new Room(roomid, url, roompass, chat);
			return callback(undefined, room);
		}
	);
}

function updateRoom(room, callback) {
	console.log('ASDKALSJLKASJDKLJA ' + room);
	db.updateObject(room, 'rooms', 'roomid',
		function (error, result) {
			if (error) return callback(error);
			return callback(undefined, result);
		}
	);
}

function destroyRoom(roomid, callback) {
// 	db.destroyObjects('rooms_boards', 'roomid', roomid,
// 		function (error, id) {
// 			if (error) return callback(error);

// 			db.destroyObjects('rooms_members', 'roomid', roomid,
// 				function (error, result) {
// 					if (error) return callback(error);

// 					db.destroyObjects('rooms_moderators', 'roomid', roomid,
// 						function (error, result) {
// 							if (error) return callback(error);

// 							db.destroyObjectsMulti('boards', 'boardid', ids) {
// 								function (error, result) {
// 									if (error) return callback(error);

// 									db.destroyObjects('rooms', 'roomid', roomid,
// 										function (error, result) {
// 											if (error) return callback(error);
// 											return callback(undefined, result);
// 										}
// 									);
// 								}
// 							);
// 						}
// 					);
// 				}
// 			);
// 		}
// 	);
}

function readRoomsFor(userid, callback) {
	db.readObjectsFor(readRoom, 'rooms_members', 'roomid', 'userid', userid,
		function (error, result) {
			if (error) return callback(error);
			return callback(undefined, result);
		}
	);
}

// function readRoomsFor(userid, callback) {
// 	pg.connect(connectionString,												// try to connect to the database
// 		function (error, database, done) {
// 			if (error) return callback(error);

// 			var columns = [];													// create an empty array to store columns
// 			columns[columns.length] = 'roomid';									// look for the roomid

// 			var querystring = db.selectFrom(columns,
// 				'rooms_members', 'memberID = ' + userid);	

// 			db.query(database, done, querystring,
// 				function (error, roomsJSON) {
// 					if (error) return callback(error);

// 					var rooms = [];
// 					var roomArray = JSON.parse(roomsJSON);
// 					db.readObjects(readRoom, rooms, roomArray,
// 						function (error, result) {
// 							if (error) return callback(error);
// 							return callback(undefined, result);
// 						}
// 					);
// 				}
// 			);
// 		}
// 	);
// }

function readEntireRoom(roomid, callback) {
	// readRoom
	// readModerators
	// readMembers
	// readBoards
}

function uncreateRoom(roomid, uncreate, callback) {
	destroyRoom(roomid,
		function (error, result) {
			if (error) return callback(uncreate + '\n' + error);
			return callback(uncreate);
		}
	);
}

// columns = [];
// columns[columns.length] = 'userid';
// querystring = db.selectFrom(columns,						// select userid from rooms_moderators where roomid = roomid
// 	'rooms_moderators', 'roomid = ' + roomid);
// db.query(database, done, querystring, false,				// query the database
// 	function (error, result) {
// 		if (error) return callback(error);					// if there was an error, return it

// 		// console.log('result returned:');
// 		// for (var property in result[0]) {
// 		// 	console.log(property + ': ' + result[0][property]);
// 		// }
// 		// console.log();


// 		var moderatorIDs = [];
// 		for (var i = 0; i < result.length; i++ ) {
// 			moderatorIDs[moderatorIDs.length] = result[i]['userid'];
// 		}

// 		querystring = db.selectFrom(columns,				// select
// 			'rooms_members', 'roomid = ' + roomid);
// 		db.query(database, done, querystring, false,
// 			function (error, result) {
// 				if (error) return callback(error);

// 				// console.log('result returned:');
// 				// for (var property in result) {
// 				// 	console.log(property + ': ' + result[property]);
// 				// }
// 				// console.log();

// 				var memberIDs = [];
// 				for (var i = 0; i < result.length; i++ ) {
// 					memberIDs[memberIDs.length] = result[i]['userid'];
// 				}

// 				columns = [];
// 				columns[columns.length] = 'boardid';
// 				querystring = db.selectFrom(columns,
// 					'rooms_boards', 'roomid = ' + roomid);
// 				db.query(database, done, querystring, false,
// 					function (error, result) {
// 						if (error) return callback(error);

// 						// console.log('result returned:');
// 						// for (var property in result) {
// 						// 	console.log(property + ': ' + result[property]);
// 						// }
// 						// console.log();

// 						var boardIDs = [];
// 						for (var i = 0; i < result.length; i++) {
// 							boardIDs[boardIDs.length] = result[i]['boardid'];
// 						}