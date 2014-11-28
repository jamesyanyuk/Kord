var express = require('express');
var router = express.Router();
var passport = require('passport');

// If user's logged in, then redirect to user view
var isAuth = function(req, res, next) {
    if(req.isAuthenticated())
        return res.redirect('/user');
    next();
}

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Kord' });
});

router.get('/login', isAuth, function(req, res) {
    res.render('login', {
        title: 'Kord',
        message: req.flash('loginmessage')
    });
});

router.get('/register', isAuth, function(req, res) {
    res.render('register', {
        title: 'Kord',
        message: req.flash('registermessage')
    });
});

router.post('/login', function(req, res, next) {
    // Check whether the user is already logged in
    if(req.isAuthenticated())
        return res.redirect('/user');
    // Check that all fields were filled
    else if(!req.body.email || !req.body.password) {
        req.flash('loginmessage', 'Field(s) left blank.');
        return res.redirect('/login')
    }

    passport.authenticate('login', function(err, user, info) {
        // Catch for exceptions during authentication
        if(err) return next(err);
        // If user hasn't been set, authentication has failed
        else if(!user) return res.redirect('/login');
        req.login(user, function(err) {
            // Catch for exceptions while establishing login session
            if(err) return next(err);
            // Redirect to user view
            return res.redirect('/user');
        });
    })(req, res, next);
});

router.post('/register', function(req, res, next) {
    // Check whether the user is already logged in
    if(req.isAuthenticated())
        return res.redirect('/user');
    // Check that all fields were filled, and that passwords match
    else if(!req.body.email || !req.body.password || !req.body.password_conf) {
        req.flash('registermessage', 'Field(s) left blank.');
        return res.redirect('/register')
    } else if(req.body.password != req.body.password_conf) {
        req.flash('registermessage', 'Passwords don\'t match.');
        return res.redirect('/register')
    }

    passport.authenticate('register', function(err, user, info) {
        // Catch for exceptions during authentication
        if(err) return next(err);
        // If user hasn't been set, authentication has failed
        else if(!user) return res.redirect('/register');
        req.login(user, function(err) {
            // Catch for exceptions while establishing register session
            if(err) return next(err);
            // Redirect to user view
            return res.redirect('/user');
        });
    })(req, res, next);
});

// Temporary
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.post('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;
