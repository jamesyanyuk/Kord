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


describe('')

///////Chat testing

//placeholder for future

///////Other testing

//placeholder for future