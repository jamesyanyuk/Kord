DROP TABLE IF EXISTS rooms CASCADE;
-- DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS boards CASCADE;
-- DROP TABLE IF EXISTS canvases CASCADE;
-- DROP TABLE IF EXISTS resources CASCADE;

-- DROP TABLE IF EXISTS rooms_chats CASCADE;
DROP TABLE IF EXISTS rooms_boards CASCADE;
-- DROP TABLE IF EXISTS boards_canvases CASCADE;
-- DROP TABLE IF EXISTS boards_resources CASCADE;


-- deleting room should delete everything
-- deleting board should delete resources
-- deleting resources only deletes self
-- resource can't exist without board, resource without room
-- board can't exist without room

CREATE TABLE rooms (
	roomID serial,												-- unique and serial room id // used as chat id
	url varchar(50) UNIQUE,														-- unique url
	password varchar(50),														-- password
	-- moderators integer[],															-- list of moderator (user) ids
	-- members integer[],															-- list of member (user) ids
	chat json,
	
	PRIMARY KEY (roomID)
);

CREATE TABLE boards (
	boardID serial,												-- unique and serial board id // used as canvas id
	canvas json,
	freeResources json,
	lockedResources json,
	
	PRIMARY KEY (boardID)
);

CREATE TABLE rooms_boards (
	roomID integer REFERENCES rooms,
	boardID integer REFERENCES boards,

	PRIMARY KEY (roomID, boardID)
);

-- INSERT INTO rooms VALUES
-- 	(1, 'http1', 'pass1', '{ chat1 '),
-- 	(2, 'http2', 'pass2', 'chat2');

-- INSERT INTO boards VALUES
-- 	(1, 'canvas1', 'resource1', 'resource2'),
-- 	(2, 'canvas2', 'resource3', 'resource4'),
-- 	(3, 'canvas3', 'resource5', 'resource6');

-- INSERT INTO rooms_boards VALUES
-- 	(1, 1),
-- 	(2, 2),
-- 	(2, 3);


-- CREATE TABLE boards_canvases (
-- 	boardID integer REFERENCES boards,
-- 	canvasID integer REFERENCES canvases,

-- 	PRIMARY KEY (boardID, canvasID)
-- );

-- CREATE TABLE boards_resources (
-- 	boardID integer REFERENCES boards,
-- 	resourceID integer REFERENCES canvases,

-- 	PRIMARY KEY (boardID, resourceID)
-- );


-- INSERT INTO chats VALUES
-- 	(1, 'chat1'),
-- 	(2, 'chat2');


-- INSERT INTO canvases VALUES
-- 	(1, 'canvas1'),
-- 	(2, 'canvas2'),
-- 	(3, 'canvas3'),
-- 	(4, 'canvas4');

-- INSERT INTO resources VALUES
-- 	(1, 'resource1'),
-- 	(2, 'resource2'),
-- 	(3, 'resource3'),
-- 	(4, 'resource4');

-- INSERT INTO rooms_chats VALUES


-- INSERT INTO rooms_boards VALUES


-- INSERT INTO boards_canvases VALUES


-- INSERT INTO boards_resources VALUES





-- CREATE TABLE chats (
-- 	chatID serial,											-- uses roomID as its id
-- 	log text,																	-- chat log will be stored as a massive string for now
	
-- 	PRIMARY KEY (chatID)
-- );




-- CREATE TABLE canvases (
-- 	canvasID serial,											-- uses boardID as its id
-- 	state text,																	-- canvas will be stored as a massive json for now
	
-- 	PRIMARY KEY (canvasID)
-- );




-- CREATE TABLE rooms_chats (
-- 	roomID integer REFERENCES rooms,
-- 	chatID integer REFERENCES chats,

-- 	PRIMARY KEY (roomID, chatID)
-- );



-- CREATE TABLE resources (
-- 	resourceID serial,
-- 	state text,

-- 	PRIMARY KEY (resourceID)
-- );






-- FIGURE THIS OUT LATER

-- // make boards reference boards
-- // make moderators reference users
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