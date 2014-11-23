var express = require('express');
var router = express.Router();
var passport = require('passport');

var isAuth = function(req, res, next) {
    if(req.isAuthenticated()){
        console.log('Already logged in, redirecting to users...');
        return res.redirect('/user'); // or just next();
    }
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
    failureRedirect: '/login',
    failureFlash: false
}));

router.post('/register', function(req, res) {
    res.render('register', { message: req.flash('message') || '' });
});

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
