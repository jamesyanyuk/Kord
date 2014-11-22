var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('user', { user: req.user });
});

router.get('/login', function(req, res) {
    res.render('login', { message: req.flash('login') || '' });
});

router.post('/login', passport.authenticate);

//router.post('/logout', ...);

router.get('/register', function(req, res) {
    res.render('register', { message: req.flash('register') || '' });
});

router.get('/register', function(req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;
