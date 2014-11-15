var query = require('db').query;

function Chat(roomID, log) {
	this.roomID = roomID;
	this.log = log;
	
}

function createChat(roomID, callback) {
	pg.connect(connectionString,												// try to connect to the database
		function (error, database, done) {
			if (error) {														// if there was an error
				return callback(error);											// return the error
			}
			else {																// if there was no error
				var chat = new Chat(roomID);									// create a new chat object
				
				var querystring = 'INSERT INTO chats VALUES ' + '(' +			// create the query string
					chat.roomID + ',' +
					chat.log + ',', +
					');';
				query(database, done, querystring, callback);			// actually query the database
				return chat;
			}
		}
	);
}


function updateChat() {
	
}