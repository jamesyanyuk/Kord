var db = require('../db');
var canvasdb = require('../canvasdb');

exports.create = function (boardid, canvas, freeresources, lockedresources) {
	return new Board(boardid, canvas, freeresources, lockedresources);
};

exports.createBoard = createBoard;
exports.readBoard = readBoard;
exports.readBoardsFor = readBoardsFor;
exports.updateBoard = updateBoard;
exports.destroyBoard = destroyBoard;

var TABLE = 'boards';
var ID = 'boardid';

function Board(boardid, canvas, freeresources, lockedresources) {
	this.boardid = boardid;
	this.canvas = canvas;
	this.freeresources = freeresources;
	this.lockedresources = lockedresources;
}

/*
 * create functions
 * */

function createBoard(roomid, callback) {
	var canvas = canvasdb.create();											// create a new canvas
	var freeresources = [];												// create an empty array to store free resources
	var lockedresources = [];											// create an empty array to store locked resourced

	var data = [];														// create an empty array to store the query parameters
	data[data.length] = db.nextID(TABLE, ID);					// get the next id
	data[data.length] = canvas;											// use the canvas
	data[data.length] = freeresources;									// use the free resources
	data[data.length] = lockedresources;								// use the locked resources
	db.createObject(TABLE, data, ID,
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
					var board = new Board(boardid, canvas, freeresources, lockedresources);
					return callback(undefined, board);
				}
			);			
		}
	);
}

function joinRoomBoard(roomid, boardid, callback) {
	db.joinObjects('rooms', TABLE, roomid, boardid,
		function (error, result) {
			if (error) return callback(error);
			return callback(undefined, result);
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

			var canvas = result['canvas'];
			var freeresources = result['freeresources'];
			var lockedresources = result['lockedresources'];
			var board = new Board(boardid, canvas, freeresources, lockedresources);
			return callback(undefined, board);
		}
	);
}

function readBoardsFor(roomid, callback) {
	db.readObjectsFor(readBoard, 'rooms_boards', ID, 'roomid', roomid,
		function (error, result) {
			if (error) return callback(error);
			return callback(undefined, result);
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
			return callback(undefined, result);
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
			return callback(undefined, result);
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