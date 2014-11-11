package pa1.autograding;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.nio.ByteBuffer;
import java.nio.channels.SocketChannel;

import pa1.AbstractNIOServer;
import pa1.Config;
import pa1.FileManager;

/**
 * @author V. Arun
 */
/* This class implements the grading server. It waits for 
 * (1) an "IAM studentID" command, which initiates grading
 * (2) an answer followed by a newline on the same connection
 * 
 * Each IAM command starts a new challenge, i.e. a scrambled
 * file is specifically created in anticipation of an answer
 * after the client has downloaded the scrambled file using
 * FileServer or TorrentServer.
 */
public class GradingServer extends AbstractNIOServer {

	public static final String CHALLENGE =
			"%s : What is the 4-byte XOR checksum, "
					+ "i.e., the sequential XOR of all 4-byte words, of the file with this name?";

	public static final String NO_TEST_INITIATED_MESSAGE =
			"No prior test yet initiated on this server. To initiate a test, " +
					"send a message in the format '" +
					Config.Commands.IAM.toString() +
					" <ID>' " +
					"where <ID> is your numerical identifier " +
					"(without the surrounding  \"<\" and \">\") to the testing port on this server.\n";

	public static final String FAILURE_MESSAGE =
			"Failure! You have not answered the challenge correctly. But you "
					+ "may try submitting more answers over this connection\n.";

	public static final String SUCCESS_MESSAGE =
			"Success! You have answered the challenge correctly in "
					+ " %g seconds.\n";

	public static GradingStateMap testingMap = new GradingStateMap();

	public GradingServer(int port) throws IOException {
		super(port);
		Config.setLogHandler(log, getClass());
	}

	public GradingServer() throws IOException {
		super(Config.DEFAULT_TESTING_SERVER_PORT);
		Config.setLogHandler(log, getClass());
		log.info("Initiated testing server on " +
				Config.DEFAULT_TESTING_SERVER_PORT);
	}

	@Override
	protected void processAcceptedConnection(SocketChannel connChannel) {
		// TODO Auto-generated method stub
	}

	/* The main entry point. An IAM request is expected here */
	@Override
	protected void executeRequest(String request, SocketChannel connChannel) {
		if (this.isRegisterRequest(request))
			this.processRegister(request, connChannel);
		else this.processChallengeResponse(request, connChannel);
	}

	private void send(SocketChannel connChannel, String message) {
		ByteBuffer buf = ByteBuffer.wrap(message.getBytes());
		int numWritten = 0;
		try {
			// will block until everything written or exception occurs
			while ((numWritten += connChannel.write(buf)) < message.length())
				;
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	/* Verifies submitted response to challenge */
	private void processChallengeResponse(String response,
			SocketChannel connChannel) {
		log.info("Response length = " + response.getBytes().length);
		byte[] buf = null;
		try {
			buf = response.getBytes("ISO-8859-1");
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
		String message = testingMap.verify(buf, connChannel);
		log.info(message + " on channel " + connChannel);
		this.send(connChannel, message);
	}

	protected static String generateVerificationMessage(long check) {
		String message = null;
		if (check == 0) {
			message = NO_TEST_INITIATED_MESSAGE;
		}
		else if (check < 0) {
			message = FAILURE_MESSAGE;
		}
		else if (check > 0) {
			message = String.format(SUCCESS_MESSAGE, check / 1000.0);
		}
		return message;
	}

	private boolean isRegisterRequest(String request) {
		return request.toLowerCase().trim().matches(
			Config.Commands.IAM.toString().toLowerCase() + "\\s+\\d+");
	}

	private void processRegister(String request, SocketChannel connChannel) {
		String testingID = extractClientID(request);
		String filename = FileManager.getChallengeFilename();
		String message = testingMap.register(filename, testingID, connChannel);
		String challenge =
				String.format(CHALLENGE,
					testingMap.getFile(testingID).getFilename());
		this.send(connChannel, challenge + message);

	}

	private String extractClientID(String request) {
		if (!isRegisterRequest(request)) return null;
		request = request.replaceAll("[^\\d]", "");
		Integer id = -1;
		try {
			id = Integer.valueOf(request);
		} catch (NumberFormatException nfe) {
			log.info(nfe.getMessage());
		}
		return id.toString();
	}

	public static ScrambledFile getScrambledFile(String request) {
		String testingID = FileManager.getTestingID(request);
		if (testingID != null) { return testingMap.getFile(testingID); }
		ScrambledFile sfile = FileManager.getScrambledFile(request);
		return sfile;
	}

	public static void main(String[] args) {
		try {
			(new GradingServer(Config.DEFAULT_TESTING_SERVER_PORT)).run();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
