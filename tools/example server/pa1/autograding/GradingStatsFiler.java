package pa1.autograding;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.Properties;

import org.json.JSONException;
import org.json.JSONObject;

import pa1.Config;

/**
 * @author V. Arun
 */
public class GradingStatsFiler {

	private static boolean created = false;
	static {
		createStatsDir();
		created = true;
	}

	private static void createStatsDir() {
		if (created) return;
		File file = new File(Config.DEFAULT_STATS_DIR + "anything");
		if (!file.exists()) file.getParentFile().mkdirs();
	}

	public synchronized static boolean store(GradingState state)
			throws IOException, JSONException {
		createStatsDir();
		if (!state.isChanged()) return false;
		// else store
		FileOutputStream outStream =
				new FileOutputStream(getFilename(state.getID()));
		String record = state.toJSON().toString();
		outStream.write(record.getBytes());
		return true;
	}

	public synchronized static JSONObject load(String id) {
		FileInputStream inStream;
		try {
			inStream = new FileInputStream(getFilename(id));
		} catch (FileNotFoundException e) {
			return null;
		}
		String loaded = readStream(inStream);
		if (loaded == null || loaded.isEmpty()) return null;
		JSONObject json = null;
		try {
			json = new JSONObject(loaded);
		} catch (JSONException e) {// do nothing
		}
		return json;
	}

	private static String getFilename(String id) {
		return Config.DEFAULT_STATS_DIR + id;
	}

	private static String readStream(InputStream is) {
		StringBuilder sb = new StringBuilder(512);
		try {
			Reader r = new InputStreamReader(is, "UTF-8");
			int c = 0;
			while ((c = r.read()) != -1) {
				sb.append((char) c);
			}
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
		return sb.toString();
	}

	/********************** Start of deprecated methods ****************/
	public static Properties getProperties(String id) {
		FileInputStream inStream = null;
		try {
			inStream = new FileInputStream(Config.DEFAULT_STATS_DIR + id);
		} catch (FileNotFoundException e) {
			// e.printStackTrace();
		}
		Properties properties = new Properties();
		if (inStream != null) try {
			properties.load(inStream);
		} catch (IOException e) {
			e.printStackTrace();
		}
		return properties;
	}

	public static Properties setProperties(String id, String key, String value) {
		Properties properties = getProperties(id);
		if (properties == null) properties = new Properties();
		properties.setProperty(key, value);
		FileOutputStream outStream = null;
		try {
			outStream = new FileOutputStream(Config.DEFAULT_STATS_DIR + id);
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}
		try {
			properties.store(outStream, null);
		} catch (IOException e) {
			e.printStackTrace();
		}
		return properties;
	}

	/********************** End of deprecated methods ****************/

	public static void main(String[] args) {
	}
}
