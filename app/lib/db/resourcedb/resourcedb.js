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

function Resource(resourceid, resourceurl, x, y, width, height) {
	this.resourceid = resourceid;
	this.resourceurl = resourceurl;
	this.x = x;
	this.y = y;
	this.width = width | 100;
	this.height = height | 100;
}

/*
 * create functions
 * */

function createResource(resourceid, resourceurl, x, y, width, height, callback) {
	var fields = [];
	fields[fields.length] = db.nextID(TABLE, ID);
	fields[fields.length] = resourceurl;
	fields[fields.length] = x;
	fields[fields.length] = y;
	fields[fields.length] = width | 100;
	fields[fields.length] = height | 100;
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
						resourceid, x, y, width, height, resourceurl);
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

			var resourceurl = result['resourceurl'];
			var x = result['x'];
			var y = result['y'];
			var width = result['width'];
			var height = result['height'];
			var resource = new Resource(resourceid, resourceurl, x, y, width, height);
			return callback(db.SUCCESS, resource);
		}
	);
}

function readResourcesFor(boardid, callback) {
	db.readObjectsFor('boards_resources', ID, 'boardid', boardid, readResource,
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
