var db = require('../db');

exports.create = function () {
	return new Canvas();
};

// exports.createCanvas = createCanvas;
// exports.readCanvas = readCanvas;
exports.updateCanvasFor = updateCanvasFor;
// exports.destroyCanvas = destroyCanvas;

var TABLE = 'boards';
var ID = 'canvas';

function Canvas() {
	this.state = {
		'drawings': {}
	};
}

// function createCanvas() {

// }

// function readCanvas() {

// }

function updateCanvasFor(boardid, canvas, callback) {
	db.updateField(TABLE, ID, canvas, 'boardid', boardid,
		function (error, result) {
			if (error) return callback(error);
			return callback(db.SUCCESS, result);
		}
	);
}

// function destroyCanvas() {

// }