var pg = require('pg');
var connectionString = require('../db').connectionString;
var db = require('../db');

exports.create = function () {
	return new Chat();
};

// exports.createChat = createChat;
// exports.readChat = readChat;
// exports.updateChat = updateChat;
// exports.destroyChat = destroyChat;

function Chat() {
	this.chatlog = undefined;
}

// function createChat() {

// }

// function readChat() {

// }

// function updateChat() {

// }

// function destroyChat() {

// }