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

router.post('/login', function(req, res, next) {
    // Check whether the user is already logged in
    if(req.isAuthenticated())
        return res.redirect('/user');
    passport.authenticate('login', function(err, user, info) {
        // Catch exceptions during authentication
        if(err) return next(err);
        // If user hasn't been set, authentication has failed
        else if(!user) return req.flash('loginmessage');
        req.login(user, function(err) {
            // Catch exceptions while establishing login session
            if(err) return next(err);
            // Redirect to user view
            return res.redirect('/user');
        });
    })(req, res, next);
});

router.post('/register', isAuth,
    passport.authenticate('register', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: false
    })
);

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
