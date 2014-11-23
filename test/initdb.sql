DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS rooms_members CASCADE;
DROP TABLE IF EXISTS rooms_moderators CASCADE;
DROP TABLE IF EXISTS boards CASCADE;
DROP TABLE IF EXISTS rooms_boards CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS boards_resources CASCADE;

CREATE TABLE users (
	userid serial,
	email varchar(50) UNIQUE,
	userpass varchar(50),
	nickname varchar(50),
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
	
	PRIMARY KEY (boardid)
);

CREATE TABLE rooms_boards (
	roomid integer REFERENCES rooms ON DELETE CASCADE,
	boardid integer REFERENCES boards ON DELETE CASCADE,

	PRIMARY KEY (roomid, boardid)
);

CREATE TABLE resources (
	resourceid serial,
	x integer,
	y integer,
	width integer,
	height integer,
	path varchar(50),

	PRIMARY KEY (resourceid)
);

CREATE TABLE boards_resources (
	boardid integer REFERENCES boards on DELETE CASCADE,
	resourceid integer REFERENCES resources on DELETE CASCADE,

	PRIMARY KEY (boardid, resourceid)
);

INSERT INTO users VALUES
	(-1, 'user1@place.com', 'pass1', 'user1', 0),
	(-2, 'user2@place.com', 'pass2', 'user2', 1);