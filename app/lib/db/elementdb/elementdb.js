var db = require('../db');

exports.create = function (elementid, attr) {
	return new Element(elementid, attr);
};

var TABLE = 'elements';
var ID = 'elementid';

/*
 * constructor
 * */

function Element(elementid, attr) {
	this.elementid = elementid;
	this.attr = attr;
}

/*
 * create functions
 * */

function createElement(elementid, attr, boardid) {
	var data = [];
	data[data.length] = elementid;
	data[data.length] = attr;
	db.createObject(TABLE, data, ID,
		function (error, result) {
			if (error) return callback(error);
			
			joinBoardElement(boardid, elementid,
				function (error, result) {
					if (error) {
						uncreateElement(elementid, error,
							function (error, result) {
								return callback(error);
							}
						);
						var element = new Element(elementid, attr);
						return callback(db.SUCCESS, element);
					}
				}
			);
		}
	);
}

function joinBoardElement(boardid, elementid, callback) {
	db.joinObjects(TABLE, boarddb.TABLE, elementid, boardid,
		function (error, result) {
			if (error) return callback(error);
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
			
			var attr = result['attr'];
			var element = new Element(elementid, attr);
			return callback(db.SUCCESS, element);
		}
	);
}

function readElementsFor(boardid, callback) {
	db.readObjectsFor('boards_elements', ID, 'userid', userid, readElement,
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