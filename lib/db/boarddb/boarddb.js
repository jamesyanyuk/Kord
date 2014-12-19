var db = require('../db');

exports.create = function (boardid) {
	return new Board(boardid);
};

exports.createBoard = createBoard;
exports.readBoard = readBoard;
exports.readBoardsFor = readBoardsFor;
exports.updateBoard = updateBoard;
exports.destroyBoard = destroyBoard;

var TABLE = 'boards';
var ID = 'boardid';

exports.TABLE = TABLE;
exports.ID = ID;

function Board(boardid) {
	this.boardid = boardid;
}

/*
 * create functions
 * */

function createBoard(roomid, callback) {
	var fields = [];															// create an empty array to store the query parameters
	fields[fields.length] = db.nextID(TABLE, ID);								// get the next id
	db.createObject(TABLE, fields, ID,
		function (error, result) {
			if (error) return callback(error);

			var boardid = result;
			joinRoomBoard(roomid, boardid,
				function (error, result) {
					if (error) {
						uncreateBoard(boardid, error,
							function (error, result) {
								return callback(error);
							}
						);
					}
					var board = new Board(boardid);
					return callback(db.SUCCESS, board);
				}
			);
		}
	);
}

function joinRoomBoard(roomid, boardid, callback) {
	db.joinObjects('rooms', TABLE, roomid, boardid,
		function (error, result) {
			if (error) return callback(error);
			return callback(db.SUCCESS, result);
		}
	);
}

/*
 * read functions
 * */

function readBoard(boardid, callback) {
	db.readObject(TABLE, ID, boardid,
		function (error, result) {
			if (error) return callback(error);

			var board = new Board(boardid);
			return callback(db.SUCCESS, board);
		}
	);
}

function readBoardsFor(roomid, callback) {
	db.readObjectsFor('rooms_boards', ID, 'roomid', roomid, readBoard,
		function (error, result) {
			if (error) return callback(error);
			return callback(db.SUCCESS, result);
		}
	);
}


/*
 * update functions
 * */

function updateBoard(board, callback) {
	db.updateObject(board, TABLE, ID,
		function (error, result) {
			if (error) return callback(error);
			return callback(db.SUCCESS, result);
		}
	);
}

/*
 * destroy functions
 * */

function destroyBoard(boardid, callback) {
	db.destroyObject(TABLE, ID, boardid,
		function (error, result) {
			if (error) return callback(error);
			return callback(db.SUCCESS, result);
		}
	);
}

function uncreateBoard(boardid, uncreate, callback) {
	db.destroyBoard(boardid,
		function (error, result) {
			if (error) return callback(uncreate + '; ' + error);
			return callback(uncreate);
		}
	);
}
