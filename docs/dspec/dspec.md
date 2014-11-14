<p align="right"><img src="https://github.com/umass-cs-326/team-kord.io/blob/master/docs/images/kordio.png" width="240px" alt="Where your ideas connect to our system."></p>

## Overview (v1.3)  

Kord is a centralized hub for human interaction over a digital medium,
whether that be for friends, businesses, working partners, social groups, etc.
Users will be able to chat and communicate in a room with an interactive board.
Resources such as documents, videos, etc. can be placed onto the board.
It can be drawn on. It can be used as a space for saving important links,
brainstorming, making timelines, and more.

It is a space where digital interactions have a sense of continuity and connect
people to each other, rather than to the ether.

<p align = "right"><i >[Written by  Julian Kuk - 10/16/2014]</em></p>  

## Bird's Eye View

## Component-by-Component Breakdown

### Client

### Server - Connection Management / User Authentication

### Server - Board / Chat Management

### Database - Users

### Database - Rooms

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