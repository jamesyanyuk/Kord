var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.redirect('/');
});

router.get('/login', function(req, res) {
  res.redirect('/');
});

router.get('/register', function(req, res) {
  res.send('respond with a resource');
});

module.exports = router;
