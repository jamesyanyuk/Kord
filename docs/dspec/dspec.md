<p align="right"><img src="https://github.com/umass-cs-326/team-kord.io/blob/master/docs/images/kordio.png" width="240px" alt="Where your ideas connect to our system."></p>

## Overview  

Kord is a centralized hub for communication over a digital medium,
whether that's between friends, businesses, working partners, social groups, etc.
Users will be able to chat and communicate in a room with an interactive board.
Users will be able to draw on the board or create, manipulate, and interact with
resources such as documents, videos, etc. It can be used as a space for
saving important links, brainstorming, making timelines, and more.

It is a space where digital interactions have a sense of continuity and connect
people to each other, rather than to the ether.

<p align = "right"><i >[Written by  Julian Kuk - 11/14/2014]</em></p>  

## Bird's Eye View

<p align="center"><img src="https://github.com/umass-cs-326/team-kord.io/blob/master/docs/diagrams/uml/kordoverview.png"></p>  
<p align = "right"><i >[Written by  Julian Kuk - 11/14/2014]</em></p>  

## Component-by-Component Breakdown

### Client

<p align="center"><img src="https://github.com/umass-cs-326/team-kord.io/blob/master/docs/diagrams/uml/clientview.png"></p>

**Main**  
Users accessing kord.io will be directed to the Main page if they are not logged in. From the main page they will either have the option to sign-up as a new user, or login as an existing users. Users whose sessions has been saved and are currently logged in, will be routed to the Rooms page.

**Sign-up**  
Users who are currently not registered with kord.io will have the chance to do so by signing-up using their email address and password. The sign-up process will interact with the user’s database and the user class. Upon signing-up a user will be routed to the main page where they will be able to click on “Create a Board” to access our Rooms page.

**Login**  
Users who have previously registered with kord.io will be able to login through this page. A user will login with their email and password, and Passport.js will be used to authenticate their session.

**Room Selection**  
The rooms page, accessed only through proper authentication, will hold a list of rooms a user is currently part of. From this page, users will be able to choose a Room which will direct them to another view containing all of the boards pertaining to this room.

**Board Selection**  
The room page will hold all the boards this room contains. It will also allow a user to add a new board to this room.

**Board View**  
This is where all things come together. A board will consist of a graphics markup, specifically SVG, where all of our components will be placed. While this markup language for graphics will allow our users to draw on the board, users will also be able to layer different components on top as they wish to select from our menu. A board will also have a chat where users currently on the room will be able to communicate with each other, but only one chat is assigned per room. Our board will initially use the BonsaiJS and Socket.io libraries.

**Graphics Design**  
Our application will, of course, use HTML5, CSS, and Javascript. It will use the Bootstrap framework in order to develop a responsive and aesthetically pleasing web application.

<p align = "right"><i >[Written by  Sara da Silva - 11/14/2014]</em></p>  

### Server - Connection Management / User Authentication

<p align="center"><img src="https://github.com/umass-cs-326/team-kord.io/blob/master/docs/diagrams/uml/routesandviews.png"></p>

<p align="center"><img src="https://github.com/umass-cs-326/team-kord.io/blob/master/docs/diagrams/uml/userdetails.png"></p>

This is the interac

<p align = "right"><i >[Written by James Yanyuk - 11/14/2014]</em></p>

### Server - Board / Chat Management
<p align="center"><img src="https://github.com/umass-cs-326/team-kord.io/blob/master/docs/diagrams/uml/roomandserver.png"></p>


This is the interaction between the rooms and the server. All data will be ultimately stored in the Database which only interacts with the server. The server handles calls from Room and Board. All Rooms have Boards and a single chat. Rooms can assign or unassign admins, authenticate users, create and delete boards. Each room will have a unique ID that they can use to identify themselves from other rooms when interacting with the server and database. Boards have resources that needs to be deemed locked or unlocked for interatction.

<p align = "right"><i >[Written by Nam Phan - 11/14/2014]</em></p>


<p align="center"><img src="https://github.com/umass-cs-326/team-kord.io/blob/master/docs/diagrams/uml/chatandserver.png"></p>

This shows the interaction between the chat and server. The data base ultimately stores all resoureses and only interacts with the server. The server broadcasts or emits messages recieved from chat to all chats in a room with the room ID passed by the chat call.


<p align = "right"><i >[Written by Nam Phan - 11/14/2014]</em></p>


### Database - Users  
<p align="center"><img src="https://github.com/umass-cs-326/team-kord.io/blob/master/docs/diagrams/uml/userdatabase.png"></p>  
<p align = "right"><i >[Written by  Matthaus Wolff - 11/14/2014]</em></p>  

### Database - Rooms  

<p align="center"><img src="https://github.com/umass-cs-326/team-kord.io/blob/master/docs/diagrams/uml/kordrooms.png"></p>  

The room is the locus of interaction for users. Here they can chat,
draw on the board, or upload resources. The data structures depicted above
will be how data is stored. The database will have tables for each data structure,
and store the relevant and necessary fields.
However, Resources will be stored as serialized objects, because the different
resources don't necessarily have the same structure (such as a text file versus
an audio file).  
<p align = "right"><i >[Written by  Julian Kuk - 11/14/2014]</em></p>  

## External Libraries

**Node.js**  
Serverside JavaScript environment.

**Express**  
Web framework for Node.js.

**EJS**  
Javascript template library to seamlessly integrate the Javascript and HTML of our web application.

**jQuery**  
JavaScript library to simplify the client-side scripting of HTML.

**Bootstrap**  
Our web application will use the tools provided by Bootstrap in order to create the front-end design of kord.io.

**Socket.io**  
Main engine for the boards. Socket.io simplifies the usage of WebSockets while ensuring compatibility on the users end. This will be the development base for the chat system and routing between rooms.

**Bonsai.js**  
Lightweight graphics library for drawing/animating dynamically on a board.Capable of fairly complicated development and performances while not consuming too many server resources. We prefer SVG over canvas because our app is more likely to have data overflow than it is to require complicated graphics.

**PostgreSQL**  
Database infrastructure. We chose this to handle wide-scale development with large amounts of data being handled. Very reliable and stable while being compatible with most platforms.

**Sunlight.js**  
Used for automatic syntax highlighting within html. Low weight and parallel resources.

**Less.js**  
Client-side CSS pre-processor. Adds more functionality to extend maintainability and creative freedom. Less.js allows for the defining of variables and mix-ins to make full use of Nested syntax. It also has some useful Operational Functions and Mathematical operations that make it more appealing than Sass.

**Passport.js**  
Sweet and simple Node.js authenticator. It supports persistent sessions, and has a dynamic scope. Handles large amounts of users with easy handling of success/failure and has a lightweight code base.

<p align = "right"><i >[Written by  Matthaus Wolff, Sara da Silva - 11/14/2014]</em></p>  

### Revision History
	* 0.4 11/14/2014: Design Specification  
	* 0.3 10/16/2014: Functional Specification  
	* 0.2 10/02/2014: Proposal  
	* 0.1 09/15/2014: Profile  
