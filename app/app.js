var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');
var flash = require('connect-flash');
var passport = require('passport');

// route locations
var index = require('./routes/index');
var user = require('./routes/user');
var room = require('./routes/room');

var db = require('./lib/db');
var userdb = require('./lib/db/userdb');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: 'awesomesauce',
                  resave: true,
                  saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

/* Will be isolating this portion later */
var LocalStrategy = require('passport-local').Strategy;

passport.use('login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, email, password, done) {
        // check if user exists in userdb
        userdb.authenticateUser(email, password, function(err, user) {
            if(err) {
                console.log('Error during login (potentially due to database error)');
                return done(err);
            } else if(!user) {
                console.log('Bad email/password during logon');
                return done(undefined, false, req.flash('loginmessage', 'Bad email/password'));
            } else return done(undefined, user);
        });
    })
);

passport.use('register', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, email, password, done) {
        // check for proper email and password input
        var RFC822 = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
        if(email.search(RFC822) === -1 || password.length < 6 || password.length > 18)
            return done(undefined, false, req.flash('registermessage', 'Fix issues below.'));

        // check if user exists in userdb
        userdb.createUser(email, password, db.GRP_UNVERIFIED, function(err, user) {
            if(err) {
                console.log('Email already taken.');
                return done(undefined, false, req.flash('registermessage', 'Email already taken.'));
            } else {
                console.log(user);
                return done(undefined, user);
            }
        });
    })
);

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// routes
app.use('/', index);
app.use('/user', user);
app.use('/r', room);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
