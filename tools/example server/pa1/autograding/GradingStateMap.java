package pa1.autograding;

import java.nio.channels.SocketChannel;
import java.util.HashMap;

import pa1.FileManager;

/**
 * @author V. Arun
 */
public class GradingStateMap {

	private final HashMap<String, GradingState> testingMap =
			new HashMap<String, GradingState>();
	private final HashMap<SocketChannel, String> channelToID =
			new HashMap<SocketChannel, String>();

	public synchronized String register(String filename, String testingID,
			SocketChannel channel) {
		GradingState state = this.testingMap.get(testingID);
		String message = getRegistrationMessage(testingID, state);
		ScrambledFile file = new ScrambledFile(filename, testingID);
		state = new GradingState(testingID, file);
		this.testingMap.put(testingID, state);
		this.channelToID.put(channel, testingID);
		return message;
	}

	public synchronized ScrambledFile getFile(String id) {
		GradingState state = this.getTestingState(id);
		if (state != null) return state.getFile();
		return null;
	}

	public synchronized String verify(byte[] response, SocketChannel channel) {
		GradingState state = this.getTestingState(channel);
		long check =
				(state == null ? 0
						: (state.verify(response) ? state.getDownloadDelay()
								: -1));
		return getID(channel) + " : " +
				GradingServer.generateVerificationMessage(check);
	}

	public synchronized void processRequest(String request,
			SocketChannel channel) {
		String id = FileManager.getTestingID(request);
		if (id == null) return;
		// else
		if (this.testingMap.containsKey(id)) {
			GradingState state = this.getTestingState(id);
			if (state != null) {
				if (channel != null)
					state.processRequest(request,
						channel.socket().getLocalPort());
				else state.processRequest(request);

			}
		} else 			System.out.println(request);

	}

	public synchronized void processRequest(String request) {
		this.processRequest(request, null);
	}

	/************************ Private methods below **************************/

	private synchronized String getID(SocketChannel channel) {
		return this.channelToID.get(channel);
	}

	private synchronized GradingState getTestingState(SocketChannel channel) {
		return this.testingMap.get(getID(channel));
	}

	private synchronized GradingState getTestingState(String testingID) {
		return this.testingMap.get(testingID);
	}

	private String getRegistrationMessage(String testingID, GradingState state) {
		return " Your testing time starts NOW!" +
				(state != null ? " (Discarding previous " + "test for file " +
						state.getFilename() + ")" : "") + "\n";
	}
}