var db = require('../db');

exports.create = function () {
	return new Chat();
};

// exports.createChat = createChat;
// exports.readChat = readChat;
exports.updateChatFor = updateChatFor;
// exports.destroyChat = destroyChat;

var TABLE = 'rooms';
var ID = 'chat';

function Chat() {
	this.chatlog = '';
}

// function createChat() {

// }

// function readChat() {

// }

function updateChatFor(roomid, chat, callback) {
	db.updateField(TABLE, ID, chat, 'roomid', roomid,
		function (error, result) {
			if (error) return callback(error);
			return callback(db.SUCCESS, result);
		}
	);
}

// function destroyChat() {

// }