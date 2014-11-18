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
var board = require('./routes/board');

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

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

// passport local strategy
passport.use('local-signin', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    function(username, password, done) {
        User.findOne({ username: username }, function(err, user) {
            if(err) { return done(err); }
            if(!user) { return done(null, false, { message: 'User doesn\'t exist.' }); }
            if(!user.validPassword()) { return done(null, false, { message: 'Incorrect password.' }); }
        });
    }
));

// routes
app.use('/', index);
app.use('/user', user);
app.use('/b', board);

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
