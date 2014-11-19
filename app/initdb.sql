DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS rooms_members CASCADE;
DROP TABLE IF EXISTS rooms_moderators CASCADE;
DROP TABLE IF EXISTS boards CASCADE;
DROP TABLE IF EXISTS rooms_boards CASCADE;

CREATE TABLE users (
	userid serial,
	username varchar(50),
	userpass varchar(50),
	access integer,

	PRIMARY KEY (userid)
);

CREATE TABLE rooms (
	roomid serial,
	url varchar(50) UNIQUE,
	roompass varchar(50),
	chat json,
	
	PRIMARY KEY (roomid)
);

CREATE TABLE rooms_members (
	roomid integer REFERENCES rooms ON DELETE CASCADE,
	userid integer REFERENCES users ON DELETE CASCADE,

	PRIMARY KEY (roomid, userid)
);

CREATE TABLE rooms_moderators (
	roomid integer REFERENCES rooms ON DELETE CASCADE,
	userid integer REFERENCES users ON DELETE CASCADE,

	PRIMARY KEY (roomid, userid)
);

CREATE TABLE boards (
	boardid serial,
	canvas json,
	freeResources json,
	lockedResources json,
	
	PRIMARY KEY (boardid)
);

CREATE TABLE rooms_boards (
	roomid integer REFERENCES rooms ON DELETE CASCADE,
	boardid integer REFERENCES boards ON DELETE CASCADE,

	PRIMARY KEY (roomid, boardid)
);