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
            if(!user) { return done(null, false)}
        });
    }
));

router.get('/', function(req, res) {
    res.redirect('/');
});

router.get('/login', function(req, res) {
    res.render('login', { title: 'Login' });
});

router.get('/register', function(req, res) {
    res.render('register', { title: 'Register' });
});

module.exports = router;
