function adminview(online, users) {
	onlineadmins('online admins', online);											// display the online admins
	onlineusers('online users', online);											// display the online users
	allusers('all users', users);													// display all users
	adminbuttons();																	// display the admin buttons
}

function adminbuttons() {
	createuserbutton('create user');												// display a create user button
	deleteuserbutton('delete user');												// display a delete user button
	adminmainbutton('back');														// display a back button
}

function userview(online) {
	onlineusers('online users', online);											// display the online users
	userbuttons();																	// display the user buttons
}

function userbuttons() {
	usermainbutton('back');															// display a back button
}

function onlineadmins(title, online) {
	document.write('<h1>' + title + '</h1>');										// write the title
	document.write('<ul>');															// started an unordered list
	for (var userid in online) {													// for every user
		var user = online[userid];
		if (user && user.isadmin) {													// if the user is an admin
			document.write('<li>' + user.username + '</li>');						// write the username
		}
	}
	document.write('</ul><br>');													// end the unordered list
}

function allusers(title, users) {
	document.write('<h1>' + title + '</h1>');										// write the title
	document.write('<ul>');															// start an unordered list
	for (var userid in users) {														// for every user
		var user = users[userid];
		if (user) {																	
			if(user.isadmin) {														// if the user is an admin
				document.write('<li><b><i>' + user.username + '</i></b></li>');		// write the username in bold italics
			}
			else {																	// if the user is not an admin
				document.write('<li>' + user.username + '</li>');					// write the username normally
			}
		}
	}
	document.write('</ul><br>');													// end the unordered list
}

function onlineusers(title, online) {
	document.write('<h1>' + title + '</h1>');										// write the title
	document.write('<ul>');															// start an unordered list
	for (var userid in online) {													// for every user
		var user = online[userid];
		if (user && !user.isadmin) {												// if the user is not an admin
			document.write('<li>' + user.username + '</li>');						// write the username
		}
	}
	document.write('</ul><br>');													// end the unordered list
}

function createuserbutton(buttontext) {
	document.write('<form method="get" action="/admin/createuser">');
	document.write('<button>' + buttontext + '</button>');
	document.write('</form>');
}

function deleteuserbutton(buttontext) {
	document.write('<form method="get" action="/admin/deleteuser">');
	document.write('<button>' + buttontext + '</button>');
	document.write('</form>');
}

function adminmainbutton(buttontext) {
	document.write('<form method="get" action="/admin/main">');
	document.write('<button>' + buttontext + '</button>');
	document.write('</form>');
}

function usermainbutton(buttontext) {
	document.write('<form method="get" action="/user/main">');
	document.write('<button>' + buttontext + '</button>');
	document.write('</form>');
}