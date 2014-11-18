// User library

// User objects
function User(uid, username, password) {
    this.uid = uid;
    this.username = username;
    this.password = password;
}

// Temporary in-memory database
var userdb = [];

exports.addUser = function(uid, username, password) {
    userdb.push(new User(uid, username, password));
}

exports.User = User;
