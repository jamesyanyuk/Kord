var db = require('../db');
var boarddb = require('../boarddb');

exports.create = function (elementid, attrs) {
	return new Element(elementid, attrs);
};

exports.createElement = createElement;
exports.joinBoardElement = joinBoardElement;
exports.readElement = readElement;
exports.readElementsFor = readElementsFor;
exports.updateElement = updateElement;
exports.destroyElement = destroyElement;
exports.uncreateElement = uncreateElement;

var TABLE = 'elements';
var ID = 'elementid';

/*
 * constructor
 * */

function Element(elementid, attrs) {
	this.elementid = elementid;
	this.attrs = attrs;
}

/*
 * create functions
 * */

function createElement(elementid, attrs, boardid, callback) {
	var data = [];
	data[data.length] = elementid;
	data[data.length] = attrs;

	db.createObject(TABLE, data, ID,
		function (error, result) {
			if (error) return console.log(error);

			joinBoardElement(boardid, elementid,
				function (error, result) {
					if (error) {
						uncreateElement(elementid, error,
							function (error, result) {
								return console.log(error);
							}
						);
					}

					var element = new Element(elementid, attrs);
					console.log('test');
					for (var prop in element) {
						console.log(prop + ': ' + element[prop]);
					}
					return callback(db.SUCCESS, element);
				}
			);
		}
	);
}

function joinBoardElement(boardid, elementid, callback) {
	console.log('entering joinBoardElem');
	db.joinObjects(boarddb.TABLE, TABLE, boardid, elementid,
		function (error, result) {
			if (error) return callback(error);
			for(var prop in result) {
				console.log(prop + ': ' + result[prop]);
			}
			return callback(db.SUCCESS, result);
		}
	);
}

/*
 * read functions
 * */

function readElement(elementid, callback) {
	db.readObject(TABLE, ID, elementid,
		function (error, result) {
			if (error) return callback(error);

			var attrs = result['attrs'];
			var element = new Element(elementid, attrs);
			return callback(db.SUCCESS, element);
		}
	);
}

function readElementsFor(boardid, callback) {
	db.readObjectsFor('boards_elements', ID, 'boardid', boardid, readElement,
		function (error, result) {
			if (error) return callback(error);
			return callback(db.SUCCESS, result);
		}
	);
}

/*
 * update functions
 * */

function updateElement(element, callback) {
	db.updateObject(TABLE, ID, element,
		function (error, result) {
			if (error) return callback(error);
			return callback(db.SUCCESS, result);
		}
	);
}

/*
 * destroy functions
 * */

function destroyElement(elementid, callback) {
	db.destroyObject(TABLE, ID, elementid,
		function (error, result) {
			if (error) return callback(error);
			return callback(db.SUCCESS, result);
		}
	);
}

function uncreateElement(elementid, uncreate, callback) {
	destroyElement(elementid,
		function (error, result) {
			if (error) return callback(uncreate + '; ' + error);
			return callback(uncreate);
		}
	);
}
