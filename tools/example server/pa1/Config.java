package gradingServer;

import java.io.File;
import java.io.IOException;
import java.util.logging.FileHandler;
import java.util.logging.Formatter;
import java.util.logging.Handler;
import java.util.logging.Logger;
import java.util.logging.SimpleFormatter;

/**
 * @author V. Arun
 */
public class Config {
	public static final int DEFAULT_FIXED_PORT = 18765;
	public static final int DEFAULT_TORRENT_SERVER_PORT = 19876;
	public static final int DEFAULT_TESTING_SERVER_PORT = 20001;

	public static final int DEFAULT_BLOCK_SIZE = 10000;
	public static final int DEFAULT_BYTES_PER_EVENT = DEFAULT_BLOCK_SIZE / 10;

	public static final int DEFAULT_CHALLENGE_RESPONSE_LENGTH = 4;

	public static final String DEFAULT_SEPARATOR_REGEX = ":";
	public static final String DEFAULT_SEPARATOR_STRING = ":";

	public static final String DEFAULT_FILENAME_BLOCKNUM_SEPARATOR_REGEX =
			DEFAULT_SEPARATOR_REGEX;
	public static final String DEFAULT_FILENAME_BLOCKNUM_SEPARATOR_STRING =
			DEFAULT_SEPARATOR_STRING;
	public static final String DEFAULT_WILDCARD_BLOCKNUM_REGEX = "\\*";
	public static final String DEFAULT_WILDCARD_BLOCKNUM_STRING = "*";
	public static final String DEFAULT_REQUEST_SPLITTER_REGEX = "\r?\n";
	public static final String DEFAULT_REQUEST_SPLITTER_STRING = "\n";
	public static final String DEFAULT_ID_FILENAME_SEPARATOR = "_";
	public static final boolean DEFAULT_REQUEST_SPLITTER_IS_NLCR = true;

	public static final String DEFAULT_LOGGING_DIR = "log/";
	public static final String DEFAULT_STATS_DIR = "log/stats/";
	public static final String DEFAULT_LOG_FILE_EXTN = ".log";
	public static final String DEFAULT_RESOURCES_DIR = "resources/";

	public static final int DEFAULT_STRETCH_DURATION = 10; // corresponds to about 8 seconds of download time for redsox.jpg
	public static final int DEFAULT_TESTING_STRETCH_DURATION = 200; // corresponds to about 2 mins of download time for redsox.jpg
	public static final int DEFAULT_INTER_TORRENT_REQUEST_DELAY = 2000; // 2 secs per-IP
	public static int stretch_duration = DEFAULT_STRETCH_DURATION;

	public static enum TorrentFields {
		NUM_BLOCKS, FILE_SIZE, IP1, PORT1, IP2, PORT2
	};

	public static final String getTorrentResponseFormat() {
		String format = "";
		for (TorrentFields field : TorrentFields.values()) {
			format +=
					field.toString() +
							DEFAULT_SEPARATOR_STRING +
							(field.toString().matches("IP.*") ? " %s\n"
									: " %d\n");
		}
		return format;
	}

	public static final Formatter DEFAULT_LOG_FORMATTER = new SimpleFormatter();

	public static enum Commands {
		GET, GETHDR, IAM
	};

	public static enum HeaderFields {
		BODY_BYTE_OFFSET_IN_FILE, BODY_BYTE_LENGTH
	};

	public static Logger setLogHandler(Logger log, String filename) {
		try {
			(new File(filename)).getParentFile().mkdirs();
			Handler logFile = new FileHandler(filename);
			logFile.setFormatter(Config.DEFAULT_LOG_FORMATTER);
			log.addHandler(logFile);
		} catch (IOException e) {
			log.severe("Error creating log file " + filename);
			return null;
		}
		return log;
	}

	public static Logger setLogHandler(Logger log, Class<?> c) {
		return setLogHandler(log, Config.DEFAULT_LOGGING_DIR + c.getName() +
				Config.DEFAULT_LOG_FILE_EXTN);
	}

	public static Logger setLogHandler(Class<?> c) {
		return setLogHandler(Logger.getLogger(c.getName()), c);
	}

	public static enum StatusCode {
		OK(200), BAD_FORMAT(400);

		private final int code;

		StatusCode(int code) {
			this.code = code;
		}

		public int getCode() {
			return this.code;
		}

		public String getStatusCode() {
			return this.code + " " + this.toString();
		}

		public static StatusCode getLabel(int code) {
			for (StatusCode sc : StatusCode.values())
				if (code == sc.getCode()) return sc;
			return null;
		}
	};

	public static final int getStretchDuration() {
		return stretch_duration;
	}

	public static final void setStretchDuration(int sd) {
		stretch_duration = sd;
	}

	public static void main(String[] args) {
		File file = new File("log/test.log");
		if (!file.exists()) try {
			file.createNewFile();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
