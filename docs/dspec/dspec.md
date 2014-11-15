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

<p align="left"><img src="https://github.com/umass-cs-326/team-kord.io/blob/master/docs/diagrams/uml/kordoverview.png"></p>  
<p align = "right"><i >[Written by  Julian Kuk - 11/14/2014]</em></p>  

## Component-by-Component Breakdown
===================================

### Client

<p align="left"><img src="https://github.com/umass-cs-326/team-kord.io/blob/master/docs/diagrams/uml/clientview.png"></p>

Main:  
Users accessing kord.io will be directed to the Main page if they are not logged in. From the main page they will either have the option to sign-up as a new user, or login as an existing users. Users whose sessions has been saved and are currently logged in, will be routed to the Rooms page.

Sign-up:  
Users who are currently not registered with kord.io will have the chance to do so by signing-up using their email address and password. The sign-up process will interact with the user’s database and the user class. Upon signing-up a user will be routed to the main page where they will be able to click on “Create a Board” to access our Rooms page.

Login:  
Users who have previously registered with kord.io will be able to login through this page. A user will login with their email and password, and Passport.js will be used to authenticate their session.

Rooms Selection:  
The rooms page, accessed only through proper authentication, will hold a list of rooms a user is currently part of. From this page, users will be able to choose a Room which will direct them to another view containing all of the boards pertaining to this room.

Room Selection:  
The room page will hold all the boards this room contains. It will also allow a user to add a new board to this room.

Board View:  
This is where all things come together. A board will consist of a graphics markup, specifically SVG, where all of our components will be placed. While this markup language for graphics will allow our users to draw on the board, users will also be able to layer different components on top as they wish to select from our menu. A board will also have a chat where users currently on the room will be able to communicate with each other, but only one chat is assigned per room. Our board will initially use the BonsaiJS and Socket.io libraries.

Graphics Design:  
Our application will, of course, use HTML5, CSS, and Javascript. It will use the Bootstrap framework in order to develop a responsive and aesthetically pleasing web application.

### Server - Connection Management / User Authentication



### Server - Board / Chat Management

### Database - Users

### Database - Rooms

<p align="left"><img src="https://github.com/umass-cs-326/team-kord.io/blob/master/docs/diagrams/uml/kordrooms.png"></p>  

The room is the locus of interaction for users. Here they can chat,
draw on the board, or upload resources.
<p align = "right"><i >[Written by  Julian Kuk - 11/14/2014]</em></p>  

## External Libraries

﻿* Socket.io

	Main engine for the boards. Socket.io simplifies the usage of WebSockets while ensuring compatibility on the users end.
	This will be the development base for the chat system and routing between rooms.

* Bonsai.js

>Lightweight graphics library for drawing/animating dynamically on a board.
>Capable of fairly complicated development and preformances while not consuming too many server resources.
>We prefer svg over canvas because our app is more likely to have data overflow than it is to require complicated grahpics.

 PostgreSQL

>Database infastructure. We chose this to handle wide-scale development with large amounts of data being handled.
>Very reliable and stable while being compatible with most platforms.

*Sunlight.js

>Used for automatic syntax highlighting within html. Low weight and parallel resources.

 Less.js

>Client-side CSS pre-processor. Adds more functionality to extend maintainability and creative freedom.
>Less.js allows for the defining of variables and mixins to make full use of Nested syntax. It also has some useful Operational Functions and Mathematical operations that make it more appealing than Sass.

 Passport.js

>Sweet and simple Node.js authenticator. It supports presistent sessions, and has a dynamic scope.
>Handles large amounts of users with easy handleing of success/failure and has a lightweight code base.

<p align = "right"><i >[Written by  Matthaus Wolff - 11/12/2014]</em></p>  

### Revision History
	* 0.1 Date: Desc
