var db = require('../db');

exports.create = function () {
	return new Chat();
};

// exports.createChat = createChat;
// exports.readChat = readChat;
exports.updateChat = updateChat;
// exports.destroyChat = destroyChat;

function Chat() {
	this.chatlog = undefined;
}

// function createChat() {

// }

// function readChat() {

// }

function updateChat(roomid, chat, callback) {
	// db.updateField('chat', chat, 'rooms', 'roomid',
	// 	function (error, result) {
	// 		if (error) return callback(error);
	// 		return callback(undefined, result);
	// 	}
	// );
}

// function destroyChat() {

// }