var express = require('express');
var router = express.Router();

router.get('/',
	function(request, response) {
		console.log('new request');
		var uid = Math.random().toString().substr(2, 4);
		// var bid = Math.random().toString().substr(2, 4);
		// var rid = Math.random().toString().substr(2, 4);
		console.log(uid);
	    response.render('test',
			{ title : 'test',
			userid : uid,
			boardid : '2',
			roomid : '3' }
		);
	}
);

module.exports = router;