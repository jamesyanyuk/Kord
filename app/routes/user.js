var express = require('express');
var router = express.Router();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    function(username, password, done) {
        User.findOne({ username: username }, function(err, user) {
            if(err) { return done(err); }
            if(!user) { return done(null, false, { message: 'Incorrect username.' }); }
            if(!user.validPassword()) { return done(null, false, { message: })}
        });
    }
));

router.get('/', function(req, res) {
    res.render('user', { user: req.user });
});

router.get('/login', function(req, res) {
    res.render('login', { message: flash('login') });
});

//router.post('/login', ...);

//router.post('/logout', ...);

router.get('/register', function(req, res) {
    res.render('register', { message: flash('register') });
});

router.get('/register', function(req, res) {
    req.logout();
    res.redirect('/');
});

function isLoggedIn(req, res, done) {
    if(req.isAuthenticated)
}

module.exports = router;