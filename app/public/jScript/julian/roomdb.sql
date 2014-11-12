-- DROP TABLE if exists users CASCADE;
-- DROP TABLE if exists addresses CASCADE;
-- DROP TABLE if exists useraddressrelations CASCADE;
-- only drop if testing or something similar

CREATE TABLE rooms (
	roomID int UNIQUE SERIAL,													-- room id as an integer // used as chat id
	url varchar(50) UNIQUE,														-- url as a string -- must be unique
	password varchar(50),														-- password as a string
	boards integer[],															-- boards as an array of integers (board ids)
	admins integer[],															-- admins as an array of integers (admin ids)
	members integer[],															-- members as an array of integers (member ids)
	
	PRIMARY KEY (roomID)
);

CREATE TABLE chats (
	roomID int REFERENCES rooms,												-- uses roomID as its id
	log text,																	-- chat as a string -- figure out a better way
	
	PRIMARY KEY (roomID)
);

CREATE TABLE boards (
	boardID integer UNIQUE SERIAL,												-- board id as an integer // used as canvas id
	canvas integer REFERENCES canvases,
	-- freeResources
	-- lockedResources
	
	PRIMARY KEY (boardID)
);

CREATE TABLE canvases (
	boardID integer REFERENCES boards,											-- uses boardID as its id
	state text,																	-- canvas will be stored as a massive json for now
	
	PRIMARY KEY (boardID)
);


-- CREATE TABLE resources (
-- 	
-- 	
-- );



-- FIGURE THIS OUT LATER

-- // make boards reference boards
-- // make admins reference users
-- // make members reference users

-- CREATE TABLE rooms_boards (
-- 	roomID int REFERENCES rooms,
-- 	"boardID" int REFERENCES boards("boardID"),
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