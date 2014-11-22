var express = require('express');
var router = express.Router();

router.get('/:rid', function(req, res) {
    res.send("Room id: " + req.params.rid);
});

module.exports = router;
