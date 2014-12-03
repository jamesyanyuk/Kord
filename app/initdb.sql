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
	roomurl varchar(50) UNIQUE,
	roompass varchar(50),
	chat json[],

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

	PRIMARY KEY (boardid)
);

CREATE TABLE rooms_boards (
	roomid integer REFERENCES rooms ON DELETE CASCADE,
	boardid integer REFERENCES boards ON DELETE CASCADE,

	PRIMARY KEY (roomid, boardid)
);

CREATE TABLE resources (
	resourceid varchar(50) UNIQUE, -- concatenation of 'b'boardid'u'userid'r'elementid -> client generated, client keeps a list of available ids
	resourceurl varchar(50),
	x integer,
	y integer,
	width integer,
	height integer,

	PRIMARY KEY (resourceid)
);

CREATE TABLE boards_resources (
	boardid integer REFERENCES boards on DELETE CASCADE,
	resourceid varchar(50) REFERENCES resources on DELETE CASCADE,

	PRIMARY KEY (boardid, resourceid)
);

CREATE TABLE elements (
	elementid varchar(50) UNIQUE, -- concatenation of 'b'boardid'u'userid'e'elementid -> client generated, client keeps a list of available ids
	attr json,

	PRIMARY KEY (elementid)
);

CREATE TABLE boards_elements (
	boardid integer REFERENCES boards ON DELETE CASCADE,
	elementid varchar(50) REFERENCES elements ON DELETE CASCADE,

	PRIMARY KEY (boardid, elementid)
);

INSERT INTO users VALUES
	(-1, 'user1@place.com', 'pass1', 'user1', 0),
	(-2, 'user2@place.com', 'pass2', 'user2', 1);
