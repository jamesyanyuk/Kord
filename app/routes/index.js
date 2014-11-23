var express = require('express');
var router = express.Router();
var passport = require('passport');

var isAuth = function(req, res, next) {
    if(req.isAuthenticated())
        return res.redirect('/user'); // or just next();
    next();
}

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Kord' });
});

// temp
router.get('/login', isAuth, function(req, res) {
    res.render('login', { message: req.flash('loginmessage') || '' });
});

router.post('/login', isAuth, passport.authenticate('login', {
    successRedirect: '/user',
    failureRedirect: '/',
    failureFlash: false
}));

router.get('/register', isAuth, function(req, res) {
    res.render('register', { message: req.flash('registermessage') || '' });
});

router.post('/register', isAuth, passport.authenticate('register', {
    successRedirect: '/',
    failureRedirect: '/',
    failureFlash: false
}));

// temp
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.post('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;
