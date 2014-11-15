var query = require('db').query;

function Room(roomID, url, password, chat, boards, admins, members) {
	this.roomID = roomID;
	this.url = url;
	this.password = password;
	this.chat = chat;
	this.boards = boards;
	this.admins = admins;
	this.members = members;
}

function createRoom(url, password, creator, callback) {
	pg.connect(connectionString,												// try to connect to the database
		function (error, database, done) {
			if (error) {														// if there was an error
				return callback(error);											// return the error
			}
			else {																// if there was no error
				var roomID = nextval('rooms_roomID_seq');						// get the next valid room id				
				createChat(roomID,												// create a chat object with the room id
					function (error, chat) {
						
						var boards = [];										// create an empty array to store boards
						createBoard(boards,										// create a board object and store it in the array
							function (error, board) {
								
								var admins = [];												// create an empty array to store the admins
								var users = [];													// create an empty array to store the users
								
								admins[admins.length] = creator;								// add the creator to the list of admins
								members[members.length] = creator;								// add the creator to the list of members
								
								var room = new Room(roomID,										// create a room object
										url, password, chat, board, admins, users);
								
								var querystring = 'INSERT INTO rooms VALUES ' + '(' +			// create the query string
									room.roomID + ',' +
									room.url + ',' +
									room.password + ',' +
									room.boards + ',' +
									room.admins + ',' +
									room.members +
									');';
								query(database, done, querystring, callback);			// actually query the database
								return room;
							}
						);
					}
				);
			}
		}
	);
}
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