var pg = require('pg');
var connectionString = require('../db').connectionString;
var db = require('../db');

exports.create = function (resourceid) {
	return new Resource(resourceid);
};

// exports.createResource = createResource;
// exports.readResource = readResource;
// exports.updateResource = updateResource;
// exports.destroyResource = destroyResource;

function Resource(resourceid) {
	this.resourceid = resourceid;
	this.x = 0;
	this.y = 0;
	this.data = undefined;
}

// function createResource() {

// }

// function readResource() {

// }

// function updateResource() {

// }

// function destroyResource() {

// }