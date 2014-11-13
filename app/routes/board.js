var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.redirect('/user');
});

router.get('/:bid', function(req, res) {
    res.send(req.params.bid);
});

module.exports = router;
