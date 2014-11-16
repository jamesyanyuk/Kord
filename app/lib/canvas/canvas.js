// var query = require('../db').query;

function Canvas() {
	// this.boardID = boardID;
	this.state = undefined;
}


// function createCanvas(boardID) {
// 	pg.connect(connectionString,												// try to connect to the database
// 		function (error, database, done) {
// 			if (error) {														// if there was an error
// 				return callback(error);											// return the error
// 			}
// 			else {																// if there was no error
// 				var state = EMPTY STATE;										// create an empty json for this
// 				var canvas = new Canvas(boardID);
											
// 				var querystring = 'INSERT INTO canvases VALUES ' + '(' +			// create the query string
// 					canvas.boardID + ',' +
// 					canvas.state + ',', +
// 					');';
// 				query(database, done, querystring, callback);			// actually query the database
// 				return canvas;
// 			}
// 		}
// 	);
// }


module.exports = Canvas;

function updateCanvas() {
	
}