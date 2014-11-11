package pa1.autograding;

import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import pa1.Config;
import pa1.FileManager;

/**
 * @author V. Arun
 */
public class GradingState {

	public static enum Keys {
		TESTING_ID, // student ID <br>
		FILE_STATS, // top-level stats key for all files, all other fields below are per-file <br>
		BEST_DOWNLOAD_DELAY, // best download delay (secs) among all successfully verified downloads <br>
		LAST_DOWNLOAD_DELAY, // download delay (secs) of most recent successfully verified download <br>
		FILENAME, // name of the file, e.g., redsox.jpg (ignoring the studentID_ prefix) <br>
		INIT_TIME, // the time when the most recent grading server test was initiated <br>
		NUM_TOTAL_REQUESTS, // total number of correctly formatted requests sent so far <br>
		RECEIVED_FULL_REQUEST, // whether a whole-file request was ever correctly received <br>
		RECEIVED_TORRENT_REQUEST, // whether a torrent request to the UDP server was ever correctly received <br>
		RECEIVED_CHUNK_REQUEST, // whether a request for a single chunk was ever correctly received <br>
		LAST_NUM_PORTS_DISCOVERED, // number of peer ports discovered in most recent graded test <br>
		LAST_NUM_PORTS_USED, // number of peer ports used in most recent graded test <br>
		RECEIVED_IAM_REQUEST, // whether an IAM request was ever correctly received  <br>
		RECEIVED_CHALLENGE_RESPONSE // whether a challenge was ever correctly answered <br>
	};

	private static class FileStats {
		final String filename;
		final long initTime;

		long lastDownloadDelay = -1;
		long bestDownloadDelay = -1;
		int numRequests = 0;
		boolean receivedFullRequest = false;
		boolean receivedTorrentRequest = false;
		boolean receivedChunkRequest = false;
		boolean receivedIAMRequest = true; // will be here only if true
		boolean receivedChallengeResponse = false;
		Set<Integer> lastNumPortsUsed = new HashSet<Integer>();
		Set<Integer> lastNumPortsDiscovered = new HashSet<Integer>();

		FileStats(String filename) {
			this.filename = filename;
			this.initTime = System.currentTimeMillis();
		}

		FileStats(JSONObject json) throws JSONException {
			this.filename = json.getString(Keys.FILENAME.toString());
			this.lastDownloadDelay =
					(long) (json.getDouble(Keys.LAST_DOWNLOAD_DELAY.toString()) * 1000);
			this.bestDownloadDelay =
					(long) (json.getDouble(Keys.BEST_DOWNLOAD_DELAY.toString()) * 1000);
			this.initTime = json.getLong(Keys.INIT_TIME.toString()); // must exist
			this.numRequests = json.getInt(Keys.NUM_TOTAL_REQUESTS.toString());
			this.receivedFullRequest =
					json.getBoolean(Keys.RECEIVED_FULL_REQUEST.toString());
			this.receivedTorrentRequest =
					json.getBoolean(Keys.RECEIVED_TORRENT_REQUEST.toString());
			this.receivedChunkRequest =
					json.getBoolean(Keys.RECEIVED_CHUNK_REQUEST.toString());
			this.receivedIAMRequest =
					json.getBoolean(Keys.RECEIVED_IAM_REQUEST.toString());
			this.receivedChallengeResponse =
					json.getBoolean(Keys.RECEIVED_CHALLENGE_RESPONSE.toString());

			// don't read into lastNumPortsUsed or lastNumPortsDiscovered as they are set per download
		}

		public JSONObject toJSON() throws JSONException {
			JSONObject json = new JSONObject();
			json.put(Keys.FILENAME.toString(), this.filename);
			json.put(Keys.BEST_DOWNLOAD_DELAY.toString(),
				this.bestDownloadDelay / 1000.0);
			json.put(Keys.LAST_DOWNLOAD_DELAY.toString(),
				this.lastDownloadDelay / 1000.0);
			json.put(Keys.INIT_TIME.toString(), this.initTime);
			json.put(Keys.NUM_TOTAL_REQUESTS.toString(), this.numRequests);
			json.put(Keys.RECEIVED_FULL_REQUEST.toString(),
				this.receivedFullRequest);
			json.put(Keys.RECEIVED_TORRENT_REQUEST.toString(),
				this.receivedTorrentRequest);
			json.put(Keys.RECEIVED_CHUNK_REQUEST.toString(),
				this.receivedChunkRequest);
			json.put(Keys.LAST_NUM_PORTS_DISCOVERED.toString(),
				this.lastNumPortsDiscovered.size());
			json.put(Keys.LAST_NUM_PORTS_USED.toString(),
				this.lastNumPortsUsed.size());
			json.put(Keys.RECEIVED_IAM_REQUEST.toString(),
				this.receivedIAMRequest);
			json.put(Keys.RECEIVED_CHALLENGE_RESPONSE.toString(),
				this.receivedChallengeResponse);
			return json;
		}

		public void merge(FileStats fstats) {
			if (fstats.isDownloaded()) {
				this.setLastDownloadDelay(fstats.getLastDownloadDelay());
			}

			this.numRequests += fstats.numRequests;
			fstats.numRequests = 0; // for idempotence

			this.lastNumPortsDiscovered.addAll(fstats.lastNumPortsDiscovered);
			this.lastNumPortsUsed.addAll(fstats.lastNumPortsUsed);
			this.receivedFullRequest =
					this.receivedFullRequest || fstats.receivedFullRequest;
			this.receivedTorrentRequest =
					this.receivedTorrentRequest ||
							fstats.receivedTorrentRequest;
			this.receivedChallengeResponse =
					this.receivedChallengeResponse ||
							fstats.receivedChallengeResponse;
			this.receivedIAMRequest =
					this.receivedIAMRequest || fstats.receivedIAMRequest;
		}

		void setLastDownloadDelay(long delay) {
			if (delay < 0) return;
			this.lastDownloadDelay = delay;
			if (delay < this.getBestDownloadDelay() ||
					this.getBestDownloadDelay() < 0)
				this.setBestDownloadDelay(delay);
		}

		long getBestDownloadDelay() {
			return this.bestDownloadDelay;
		}

		void setBestDownloadDelay(long delay) {
			this.bestDownloadDelay = delay;
		}

		boolean setDownloaded() {
			boolean downloaded = this.isDownloaded();
			this.setLastDownloadDelay(System.currentTimeMillis() -
					this.getInitTime());
			return !downloaded;
		}

		boolean setReceivedGetRequest() {
			boolean old = this.receivedFullRequest;
			this.receivedFullRequest = true;
			return !old;
		}

		boolean setReceivedTorrentRequest() {
			boolean old = this.receivedTorrentRequest;
			this.receivedTorrentRequest = true;
			return !old;
		}

		boolean isDownloaded() {
			return this.lastDownloadDelay > 0;
		}

		long getLastDownloadDelay() {
			return this.lastDownloadDelay;
		}

		long getInitTime() {
			return this.initTime;
		}

		int incrRequestCount() {
			return ++this.numRequests;
		}

		boolean setDiscoveredPort(int port) {
			return this.lastNumPortsDiscovered.add(port);
		}

		boolean setUsedPort(int port) {
			return this.lastNumPortsUsed.add(port);
		}

		boolean setReceivedChallengeResponse() {
			boolean old = this.receivedChallengeResponse;
			this.receivedChallengeResponse = true;
			return !old;
		}

		public String toString() {
			try {
				return this.toJSON().toString();
			} catch (JSONException e) {
				e.printStackTrace();
			}
			return null;
		}
	}

	/************************** Overall TestingState state below *****************/
	/*****************************************************************************/

	// current test's stats
	private final String testingID;
	private final ScrambledFile file;

	private boolean changed = false;
	private final FileStats curFstats;

	// historic stats information
	private final HashMap<String, FileStats> fileStats =
			new HashMap<String, FileStats>();

	GradingState(String testingID, ScrambledFile file) {
		this.testingID = testingID;
		this.file = file;
		this.curFstats = new FileStats(file.getOriginalFilename());
		try {
			this.getHistory(GradingStatsFiler.load(testingID));
		} catch (JSONException e) {
			e.printStackTrace();
		}
	}

	private synchronized boolean store() {
		try {
			GradingStatsFiler.store(this);
		} catch (IOException | JSONException e) {
			e.printStackTrace();
		}
		return true;
	}

	private synchronized void getHistory(JSONObject json) throws JSONException {
		if (json == null || json.length() == 0) return;
		JSONArray jsonArray = json.getJSONArray(Keys.FILE_STATS.toString());
		for (int i = 0; i < jsonArray.length(); i++) {
			JSONObject obj = jsonArray.getJSONObject(i);
			FileStats fstats = new FileStats(obj);
			assert (fstats != null);
			this.fileStats.put(fstats.filename, fstats);
		}
	}

	public synchronized JSONObject toJSON() throws JSONException {
		mergeIntoHistory();
		JSONObject json = new JSONObject();
		json.put(Keys.TESTING_ID.toString(), this.testingID);
		JSONArray jsonArray = new JSONArray();
		for (FileStats fstats : this.fileStats.values()) {
			assert (fstats != null);
			jsonArray.put(fstats.toJSON());
		}
		json.put(Keys.FILE_STATS.toString(), jsonArray);
		return json;
	}

	public synchronized boolean verify(byte[] response) {
		boolean verified = this.getFile().verify(response);
		if (verified) {
			this.setChanged(this.curFstats.setDownloaded());
		}
		if (response.length == Config.DEFAULT_CHALLENGE_RESPONSE_LENGTH) {
			this.setChanged(this.curFstats.setReceivedChallengeResponse());
		}
		if (this.isChanged()) this.store();
		return verified;
	}

	public synchronized boolean isChanged() {
		return this.changed;
	}

	public synchronized void processRequest(String request, int port) {
		this.setChanged(this.curFstats.incrRequestCount() > 0);
		if (FileManager.isLegitTorrentRequest(request)) {
			this.setChanged(this.curFstats.setReceivedTorrentRequest());
		}
		else if (FileManager.isLegitTestingRequest(request)) {
			this.setChanged(this.curFstats.setReceivedGetRequest());
			if (port > 0) this.setChanged(this.curFstats.setUsedPort(port));
		}
		else {
			assert (false);
		}
		if (port > 0) this.setChanged(this.curFstats.setDiscoveredPort(port));
		if (this.isChanged()) {
			this.store();
		}
	}

	public synchronized void processRequest(String request) {
		this.processRequest(request, -1);
	}

	/*
	 * Methods that do not need synchronization as they only access final fields.
	 */
	public String getID() {
		return this.testingID;
	}

	public long getInitTime() {
		return this.curFstats.getInitTime();
	}

	public String getFilename() {
		return this.file.getFilename();
	}

	public ScrambledFile getFile() {
		return this.file;
	}

	public String toString() {
		try {
			return this.toJSON().toString();
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return null;
	}

	/************* Private methods below ************************/

	public synchronized long getDownloadDelay() {
		return this.curFstats.getLastDownloadDelay();
	}

	private synchronized GradingState mergeIntoHistory() {
		FileStats fstats = this.fileStats.get(this.file.getOriginalFilename());
		if (fstats != null)
			fstats.merge(this.curFstats);
		else fstats = this.curFstats;
		this.fileStats.put(this.file.getOriginalFilename(), fstats);
		return this;
	}

	private synchronized void setChanged(boolean b) {
		this.changed = b;
	}

	/************** Testing methods below ***************/

	private synchronized void setDownloaded() {
		this.setChanged(this.curFstats.setDownloaded());
	}

	public static void main(String[] args) {
		String name1 = "filename1";
		String testingID = "12345";

		FileStats fstats1 = new FileStats(name1);

		GradingState state1 =
				new GradingState(testingID, new ScrambledFile(
						FileManager.filenames[0], testingID));
		GradingState state2 =
				new GradingState(testingID, new ScrambledFile(
						FileManager.filenames[1], testingID));

		try {
			// check FileStats conversion to json and back
			FileStats fstats3 = new FileStats(fstats1.toJSON());
			assert (fstats3.toJSON().toString().equals(fstats1.toJSON().toString()));

			assert (!state1.isChanged());
			state1.processRequest("GET " + testingID + "_" +
					FileManager.filenames[0], 4356);
			System.out.println(state1.toJSON().toString());

			state1.setDownloaded();
			System.out.println(state1.toJSON().toString());
			assert (state1.isChanged());
			GradingStatsFiler.store(state1);

			System.out.println(state2.toJSON().toString());
			state2.setDownloaded();
			System.out.println(state2.toJSON().toString());
			GradingStatsFiler.store(state2);

		} catch (JSONException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
