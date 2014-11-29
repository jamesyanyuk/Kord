var express = require('express');
var router = express.Router();

var roomdb = require('../lib/db/roomdb');

router.get('/404', function(req, res) {
    res.send('Room does\'t exist.');
});

router.get('/:rurl', function(req, res) {
    roomdb.readRoom(req.params.rurl, function(err, result) {
        if(err) return res.redirect('/r/404');
        /* temporary */
        res.redirect('/r/404');
    });
});

module.exports = router;
