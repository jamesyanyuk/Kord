var db = require('../db');

exports.create = function () {
	return new Canvas();
};

// exports.createCanvas = createCanvas;
// exports.readCanvas = readCanvas;
exports.updateCanvas = updateCanvas;
// exports.destroyCanvas = destroyCanvas;

function Canvas() {
	this.state = undefined;
}

// function createCanvas() {

// }

// function readCanvas() {

// }

function updateCanvas(canvas, callback) {
	// db.updateField(canvas, TABLE,  ID,
	// 	function (error, result) {
	// 		if (error) return callback(error);
	// 		return callback(undefined, result);
	// 	}
	// );
}

// function destroyCanvas() {

// }