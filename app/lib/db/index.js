var pg = require('pg');
var connectionstring = 'postgres://student:student@localhost/student';
// import room / chat / board / canvas libraries here
// export their functions

// use this as a main interface for other smaller libraries

function querydatabase(database, done, querystring, callback) {
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

function createRoom(url, password, creator, callback) {
	pg.connect(connectionString,												// try to connect to the database
		function (error, database, done) {
			if (error) {														// if there was an error
				return callback(error);											// return the error
			}
			else {																// if there was no error
				var roomID = nextval('rooms_roomID_seq');						// get the next valid room id
				var chat = createChat(roomID,									// create a chat object with the room id
					);								
				
				var boards = [];												// create an empty array to store boards
				boards[boards.length] = createBoard();							// create a board object and store it in the array
				
				var admins = [];												// create an empty array to store the admins
				var users = [];													// create an empty array to store the users
				
				admins[admins.length] = creator;								// add the creator to the list of admins
				members[members.length] = creator;								// add the creator to the list of members
				
				var room = new Room(roomID,										// create a room object
						url, password, chat, boards, admins, users);
				
				var querystring = 'INSERT INTO rooms VALUES ' + '(' +			// create the query string
					room.roomID + ',' +
					room.url + ',' +
					room.password + ',' +
					room.boards + ',' +
					room.admins + ',' +
					room.members +
					');';
				querydatabase(database, done, querystring, callback);			// actually query the database
				return room;
			}
		}
	);
}


function createChat(roomID, callback) {
	pg.connect(connectionString,												// try to connect to the database
		function (error, database, done) {
			if (error) {														// if there was an error
				return callback(error);											// return the error
			}
			else {																// if there was no error
				var chat = new Chat(roomID);									// create a new chat object
				
				var querystring = 'INSERT INTO chats VALUES ' + '(' +			// create the query string
					chat.roomID + ',' +
					chat.log + ',', +
					');';
				querydatabase(database, done, querystring, callback);			// actually query the database
				return chat;
			}
		}
	);
}

function createBoard(callback) {
	pg.connect(connectionString,												// try to connect to the database
		function (error, database, done) {
			if (error) {														// if there was an error
				return callback(error);											// return the error
			}
			else {																// if there was no error
				var boardID = nextval('boards_boardID_seq');
				var canvas = createCanvas(boardID,								
					);
				
				var freeResources = [];
				var lockedResources = [];
				var board = new Board(boardID,
					canvas, freeResources, lockedResources);					
				
				var querystring = 'INSERT INTO boards VALUES ' + '(' +			// create the query string
					board.boardID + ',' +
					board.canvas + ',', +
					');';
				querydatabase(database, done, querystring, callback);			// actually query the database
				return board;
			}
		}
	);
}

function createCanvas(boardID) {
	pg.connect(connectionString,												// try to connect to the database
		function (error, database, done) {
			if (error) {														// if there was an error
				return callback(error);											// return the error
			}
			else {																// if there was no error
				var state = EMPTY STATE;										// create an empty json for this
				var canvas = new Canvas(boardID);
											
				var querystring = 'INSERT INTO canvases VALUES ' + '(' +			// create the query string
					canvas.boardID + ',' +
					canvas.state + ',', +
					');';
				querydatabase(database, done, querystring, callback);			// actually query the database
				return canvas;
			}
		}
	);
}

function updateRoom(room, callback) {
	// update the room here
	// roomDB.updateRoom();
	// INSERT INTO
	return callback(undefined, true);
}

function updateChat() {
	
}

function updateCanvas() {
	
}
exports.updateCanvas = updateCanvas;

exports.getRoomByID(id, callback) = function () {
	// do the actual query here
	// SELECT blah blah blah
	var room = lookup(id);
	return callback(undefined, room);
}

server.listen(3000);




exports.createRoom = createRoom;
exports.updateRoom = updateRoom;

// exports.createChat = createChat;
// exports.updateChat = updateChat;

exports.createBoard = createBoard;
// exports.updateBoard = updateBoard;

// exports.createCanvas = createCanvas;
// exports.updateCanvas = updateCanvas;