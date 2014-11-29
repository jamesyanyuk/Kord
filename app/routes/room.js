var express = require('express');
var router = express.Router();

var roomdb = require('../lib/db/roomdb');

router.get('/:rurl', function(req, res) {
    //roomdb.readMembersFor()
});

module.exports = router;
