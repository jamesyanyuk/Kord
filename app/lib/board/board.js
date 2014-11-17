var pg = require('pg');
var connectionString = require('../db').connectionString;
var db = require('../db');
var Canvas = require('../canvas');

exports.createBoard = createBoard;
exports.readBoard = readBoard;
exports.updateBoard = updateBoard;
exports.destroyBoard = destroyBoard;

// exports.createCanvas = createCanvas;
exports.readCanvas = readCanvas;
exports.updateCanvas = updateCanvas;
// exports.destroyCanvas = destroyCanvas;

exports.freeResource = freeResource;
exports.lockResource = lockResource;

function Board(boardID, canvas, freeResources, lockedResources) {
	this.boardID = boardID;
	this.canvas = canvas;
	this.freeResources = freeResources;
	this.lockedResources = lockedResources;
}

function createBoard(roomID, callback) {
	pg.connect(connectionString,												// try to connect to the database
		function (error, database, done) {
			if (error) { return callback(error); }								// if there was an error, return it

			var canvas = new Canvas();											// create a new canvas
			var freeResources = [];												// create an empty array to store free resources
			var lockedResources = [];											// create an empty array to store locked resourced

			var data = [];														// create an empty array to store the query parameters
			data[data.length] = db.nextID('boards', 'boardID');					// get the next id
			data[data.length] = canvas;											// use the canvas
			data[data.length] = freeResources;									// use the free resources
			data[data.length] = lockedResources;								// use the locked resources

			var querystring = db.insertInto('boards', data, 'boardID');			// generate the query string
			db.query(database, done, querystring, false,							// query the database
				function (error, result) {
					if (error) { return callback(error); }						// if there was an error, return it

					var boardID = result[0]['boardid'];
					// console.log('boardID returned: ' + boardID);
					data = [];
					data[data.length] = roomID;
					data[data.length] = boardID;

					querystring = db.insertInto('rooms_boards', data)
					db.query(database, done, querystring, true,
						function (error, result) {
							if (error) { return callback(error); }
						}						
					);
					var board = new Board(boardID, canvas,						// create a new board
						freeResources, lockedResources);
					return callback(undefined, board);							// return the board
				}
			);
		}
	);
}

function getBoardsFor(roomID, callbacK) {
	pg.connect(connectionString,												// try to connect to the database
		function (error, database, done) {
			if (error) { return callback(error); }

			var columns = [];													// create an empty array to store columns
			columns[columns.length] = 'boardID';								// look for the boardID

			var querystring = db.selectFrom(columns,
				'rooms_boards', 'roomID = ' + roomID);	

			db.query(database, done, querystring, true,
				function (error, boardsJSON) {
					if (error) { return callback(error); }

					var boards = [];
					var boardArray = JSON.parse(boardsJSON);
					return db.getObjects(readBoard, boards, boardArray, 0, callback);
				}
			);
		}
	);
}

function readBoard(boardID, callback) {
	pg.connect(connectionString,												// try to connect to the database
		function (error, database, done) {
			if (error) { return callback(error); }								// if there was an error, return it

			var columns = [];
			columns[columns.length] = '*';										// select all columns
			var querystring = db.selectFrom(columns,
				'boards', 'boardID = ' + boardID);

			db.query(database, done, querystring, true,
				function (error, result) {
					if (error) { return callback(error); }						// if there was an error, return it

					// for (var prop in board) {
					// 	console.log(prop);
					// }
					// console.log();
					var board = new Board(result[0], result[1], result[2], result[3]);
					return callback(undefined, board);
				}
			);
		}
	);
}

function updateBoard(callback) {

}

function destroyBoard(caallback) {

}


// function createCanvas() {

// }

function readCanvas() {

}

function updateCanvas() {
	// what to update and how
}

// function destroyCanvas() {

// }

function freeResource() {
	// move from locked resources to free resources
}

function lockResource() {
	// moved from free to locked
}