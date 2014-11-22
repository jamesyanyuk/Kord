#Julian Kuk  
######28743834  

### Files Created  
	* /lib  
		* /online  
			* /online.js  
		* /users  
			* /users.js  
	* /public  
		* /javascripts  
			* /viewredirect.js  
			* /viewusers.js  
	* /routes  
		* /admin.js  
		* /user.js  
	* /views  
		* /adminmain.ejs  
		* /adminonline.ejs  
		* /createuser.ejs  
		* /deleteuser.ejs  
		* /login.ejs  
		* /selfdeleted.ejs  
		* /usercrud.ejs  
		* /usermain.ejs  
		* /useronline.ejs  

================================  

### To Run  

* from the terminal in the ws04 directory:  
	* npm install  
	* ./bin/www  
* from the browser:  
	* localhost:3000  
	* surf the pages like a rock lobster  

### Routes  

> routes for admins and users are contained in separate files  

* admin.js  
	* has all the routes that require admin access  
	* routes guarded by requirelogin() which also checks admin status  
* user  
	* has all the routes for generic users  
	* routes guarded by requirelogin() which is told to ignore admin status  

### Views and Javascripts  

> simpler pages done purely in html / ejs  
> more complicated pages done using javascript / html / ejs  

* viewredirect.js - has functionality for route redirection  
	* selfdeleted.ejs  
	* usercrud.ejs  
* viewusers.js - has functionality for viewing lists of users  
	* adminonline.ejs  
	* useronline.ejs  

### Libs  

> acts as in memory databases and has useful functions  

* online.js  
	* acts as an online user database  
	* has functionality for logging users in / out and requiring log ins for viewing pages  
* users.js  
	* acts as a user database  
	* has functionality for creating / deleting / authenticating users  