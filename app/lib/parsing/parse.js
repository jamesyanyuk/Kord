

function urlCheck() {
        var url = document.getElementById("url").value;
        var regex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        if (pattern.test(url)) {
            console.log("This is a ur;");
            return true;
        } 
            console.log("This is not a url");
            return false;
    }
