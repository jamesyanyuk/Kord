var db = require('../db');

exports.create = function (resourceid) {
	return new Resource(resourceid);
};

exports.createResource = createResource;
exports.readResource = readResource;
exports.readResourcesFor = readResourcesFor;
exports.updateResource = updateResource;
exports.destroyResource = destroyResource;

var TABLE = 'resources';
var ID = ['resourceid'];

function Resource(resourceid, x, y, width, height, path) {
	this.resourceid = resourceid;
	this.x = x;
	this.y = y;
	this.width = width | 100;
	this.height = height | 100;
	this.path = path;
}

/*
 * create functions
 * */

function createResource(resourceid, x, y, width, height, path, callback) {
	var fields = [];
	fields[fields.length] = db.nextID(TABLE, ID);
	fields[fields.length] = x;
	fields[fields.length] = y;
	fields[fields.length] = width | 100;
	fields[fields.length] = height | 100;
	fields[fields.length] = path;
	db.createObject(TABLE, data, ID,
		function (error, result) {
			if (error) return callback(error);

			var resourceid = result;
			joinBoardResource(boardid, resourceid,
				function (error, result) {
					if (error) {
						uncreateResource(resourceid, error,
							function (error, result) {
								return callback(error);
							}
						);
					}
					var resource = new Resource(
						resourceid, x, y, width, height, path);
					return callback(db.SUCCESS, resource);
				}
			);
		}
	);
}

function joinBoardResource(boardid, resourceid, callback) {
	db.joinObjects('boards', TABLE, boardid, resourceid,
		function (error, result) {
			if (error) return callback(error);
			return callback(db.SUCCESS, result);
		}
	);
}

/*
 * read functions
 * */

function readResource(resourceid, callback) {
	db.readObject(TABLE, ID, resourceid,
		function (error, result) {
			if (error) return callback(error);

			var x = result['x'];
			var y = result['y'];
			var width = result['width'];
			var height = result['height'];
			var path = result['path'];
			var resource = new Resource(resourceid, x, y, width, height, path);
			return callback(db.SUCCESS, resource);
		}
	);
}

function readResourcesFor(boardid, callback) {
	db.readObjectsFor(readResource, 'boards_resources', ID, 'boardid', boardid,
		function (error, result) {
			if (error) return callback(error);
			return callback(db.SUCCESS, result);
		}
	);
}

/*
 * update functions
 * */

function updateResource(resource, callback) {
	db.updateObject(resource, TABLE, ID,
		function (error, result) {
			if (error) return callback(error);
			return callback(db.SUCCESS, result);
		}
	);
}

/*
 * destroy functions
 * */

function destroyResource(resourceid, callback) {
	db.destroyObject(TABLE, ID, resourceid,
		function (error, result) {
			if (error) return callback(error);
			return callback(db.SUCCESS, result);
		}
	);
}

function uncreateResource(resourceid, uncreate, callback) {
	db.destroyResource(resourceid,
		function (error, result) {
			if (error) return callback(uncreate + '; ' + error);
			return callback(uncreate);
		}
	);
}