//Example for reference from learn-mocha github:
// var assert = require("assert"); // node.js core module

// describe('Array', function(){
//   describe('#indexOf()', function(){
//     it('should return -1 when the value is not present', function(){
//       assert.equal(-1, [1,2,3].indexOf(4)); // 4 is not present in this array so indexOf returns -1
//     })
//   })
// })

//use npm get -g mocha
//or mocha.js, mocha.css

//Db testing
var db = require("../lib/db/db.js");
var Mocha = require('mocha'),
var assert = require("assert");

    fs = require('fs'),
    path = require('path');


//Setup required for
var mocha = new Mocha;

fs.readdirSync('../lib').filter(function(file){
    return file.substr(-3) === '.js';
}).forEach(function(file){
    mocha.addFile(
        path.join('../lib', file)
    );
});


describe('createUser', function()){
	if('should create user correctly', function(){
		assert(db.createUser('joe@placebetter', 'userpass', 1, function (error, user)))
	}
}
describe('createUser2', function()){
	if('should create user correctly', function(){
		assert(db.createUser('joe' + Math.random(), 'userpass' + Math.random(), 1, function (error, user)))
	//needs to be complicated
	}
}
describe('readUser', function()){
	if('should find a user correctly', function(){
		assert(db.readUser(1, function (error, user)))
	}
}
describe('updateUser', function()){
	if('should change a password correctly', function(){
		assert(db.updateUser(user, function (error, user)))
	//needs to be complicated
	}
}
describe('readModeratorsFor', function()){
	if('should return an array of user objects', function(){
		assert(db.readModeratorsFor(1, function (error, user)))
	//needs to be complicated
	}
}
describe('readMembersFor', function()){
	if('should return and array of members', function(){
		assert(db.readMembersFor(2, function (error, user)))
	}
}
describe('destroyUser', function()){
	if('should destory a user', function(){
		assert(db.destroyUser(3, function (error, user)))
	}
}
describe('readRoom', function()){
	if('should find', function(){
		assert(db.readRoom(4, function (error, user)))
	}
}
describe('readRoomsFor', function()){
	if('should destory a user', function(){
		assert(db.readRoomsFor(5, function (error, user)))
	}
}
describe('readRoomsFor', function()){
	if('should destory a user', function(){
		assert(db.readRoomsFor(5, function (error, user)))
	//needs to be complicated
	}
}

describe('authenticateUser', function()){
	if('should correctly authenticateUser', function(){
		assert(db.authenticateUser(6 , function (error, user)))
	}
}
// db.authenticateUser('user1@place.com', 'pass1',
// 	function (error, result) {
// 		console.log('authenticate user:');
// 		printresult(error, result);
// 	}
// );

// db.authenticateUser('user2place.com', 'pass2',
// 	function (error, result) {
// 	if (error) console.log('didnt authenticate invalid username');
// 		else{
// 			console.log('authenticated invalid username :');
// 			printresult(error,result):
// 		}
// 	}
// );

// db.authenticateUser('user3@place.com', 'pass3toolongoffpasswordtoolongoffpasswordtoolongoffpassword',
// 	function (error, result) {
// 	if (error) console.log('didnt authenticate too long password');
// 		else{
// 			console.log('authenticated too long password :');
// 			printresult(error,result):
// 		}
// 	}
// );

// db.authenticateUser('user4@place.com', 'pass4_+*&?"|><>~~`)',
// 	function (error, result) {
// 	if (error) console.log('didnt authenticate invalid password');
// 		else{
// 			console.log('authenticated invalid password :');
// 			printresult(error,result):
// 		}
// 	}
// );
///////Chat testing

//placeholder for future

///////Other testing

//placeholder for future