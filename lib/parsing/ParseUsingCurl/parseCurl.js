
//Uses the Node child_process to upload files from a different website to our server

var fs = require('fs');
var url = require('url');
var spawn = require('child_process').spawn;

function downloadFile(FileUrl){
	var fileName = url.parse(FileUrl).pathname.split('/').pop();
	var file = fs.createWriteStream('./downloads/' + FileURL);

	var curl = spawn('curl', [FileURL]);
	curl.stdout.on('data',
		function(data){
			file.write(data); 
			});
	curl.stdout.on('end',
		function(data){
			file.end();
			console.log('Completed upload.');
		});

}

exports.downloadFile = downloadFile;