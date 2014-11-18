var pg = require('pg');
var connectionString = require('../db').connectionString;
var db = require('../db');

exports.create = function () {
	return new Canvas();
};

// exports.createCanvas = createCanvas;
// exports.readCanvas = readCanvas;
// exports.updateCanvas = updateCanvas;
// exports.destroyCanvas = destroyCanvas;

function Canvas() {
	this.state = undefined;
}

// function createCanvas() {

// }

// function readCanvas() {

// }

// function updateCanvas() {

// }

// function destroyCanvas() {

// }