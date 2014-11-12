function Board(boardID, canvas, freeResources, lockedResources) {
	this.boardID = boardID;
	this.canvas = canvas;
	this.freeResources = freeResources;
	this.lockedResources = lockedResources;
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
				query(database, done, querystring, callback);			// actually query the database
				return board;
			}
		}
	);
}