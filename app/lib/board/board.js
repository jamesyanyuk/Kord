var pg = require('pg');
var connectionString = require('../db').connectionString;
var db = require('../db');
var Canvas = require('../canvas');

function Board(boardID, canvas, freeResources, lockedResources) {
	this.boardID = boardID;
	this.canvas = canvas;
	this.freeResources = freeResources;
	this.lockedResources = lockedResources;
}

function createBoard(callback) {
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

			db.query(database, done, querystring, true,							// query the database
				function (error, boardID) {
					if (error) { return callback(error); }						// if there was an error, return it

					var board = new Board(boardID, canvas,						// create a new board
						freeResources, lockedResources);
					return callback(undefined, board);							// return the board
				}
			);
		}
	);
}

function freeResource() {
	// move from locked resources to free resources
}

function lockResource() {
	// moved from free to locked
}

function updateCanvas() {
	// what to update and how
}


exports.createBoard = createBoard;