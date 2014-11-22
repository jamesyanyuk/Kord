var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Kord' });
});

router.post('/login', function(req, res) {
    res.render('login', { message: req.flash('login') || '' });
});

router.post('/register', function(req, res) {
    res.render('register', { message: req.flash('register') || '' });
});

router.post('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;
