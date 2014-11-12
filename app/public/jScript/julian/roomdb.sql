-- DROP TABLE if exists users CASCADE;
-- DROP TABLE if exists addresses CASCADE;
-- DROP TABLE if exists useraddressrelations CASCADE;
-- only drop if testing or something similar

CREATE TABLE rooms (
	roomID integer UNIQUE SERIAL,												-- unique and serial room id // used as chat id
	url varchar(50) UNIQUE,														-- unique url
	password varchar(50),														-- password
	-- has a chat object
	boards integer[],															-- list of board ids
	admins integer[],															-- list of admin (user) ids
	members integer[],															-- list of member (user) ids
	
	PRIMARY KEY (roomID)
);

CREATE TABLE chats (
	roomID integer REFERENCES rooms,											-- uses roomID as its id
	log text,																	-- chat log will be stored as a massive string for now
	
	PRIMARY KEY (roomID)
);

CREATE TABLE boards (
	boardID integer UNIQUE SERIAL,												-- unique and serial board id // used as canvas id
	-- has a canvas object
	-- freeResources
	-- lockedResources
	
	PRIMARY KEY (boardID)
);

CREATE TABLE canvases (
	boardID integer REFERENCES boards,											-- uses boardID as its id
	state text,																	-- canvas will be stored as a massive json for now
	
	PRIMARY KEY (boardID)
);

-- will figure out how to implement a table for resources
-- CREATE TABLE resources (
-- 	
-- );



-- FIGURE THIS OUT LATER

-- // make boards reference boards
-- // make admins reference users
-- // make members reference users

-- CREATE TABLE rooms_boards (
-- 	roomID integer REFERENCES rooms,
-- 	"boardID" integer REFERENCES boards("boardID"),
-- 	
-- 	PRIMARY KEY (roomID, "boardID")
-- )




-- CREATE TABLE user_roles (
--    username character varying(12) references users(username),
--    "role" character varying(80) references roles("role"),
--    PRIMARY KEY(username, "role")
-- );
-- 
-- // text