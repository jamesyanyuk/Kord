var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Kord' });
});

router.get('/about', function(req, res) {
    //res.render('about', { title: 'Express' });
    res.redirect('/');
});

router.get('/help', function(req, res) {
    //res.render('help', { title: 'Express' });
    res.redirect('/');
});

router.get('/contact', function(req, res) {
    //res.render('contact', { title: 'Express' });
    res.redirect('/');
});

module.exports = router;
