//Takes a string and checks it

//Flags:
//0 means not a url
//1 means url
//2 means url contains a file

var test = "http://www.reddit.com/r/hearthstone";
var test2 = "http://i.imgur.com/3JoZIRt.jpg"
var test3 = "http: //www.reddit.com/r/funny";
var test4 = "http://i.imgur.com/3JoZIRt";

function urlCheck() {
        var url = document.getElementById("url").value;
        var regex = /(ftp|http|https|www):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        if (regex.test(url)) {
            return url;
        } 
            console.log("This is not a url");
            return 0;
    }

function fileCheck(url) {
		var regex = /^.*\.(jpg|gif|doc|pdf)$/;
		if (regex.test(url)) {
			console.log("This is a file");
			return 2;
		}
			console.log("This is a url");
			return 1;
	}