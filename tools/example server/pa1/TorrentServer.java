package gradingServer;

import java.net.*;
import java.util.Date;
import java.util.HashMap;
import java.util.logging.Logger;
import java.io.File;
import java.io.IOException;

import gradingServer.GradingServer;

/**
 * @author V. Arun
 */

/*
 * Torrent server that returns two randomly chosen
 * peers upon a request. A per-IP rate limit ensures
 * that clients can not query for new peers too fast.
 */
public class TorrentServer implements Runnable {

	private static final int MAX_REQUEST_SIZE = 128;

	private final HashMap<InetAddress, Long> lastReq =
			new HashMap<InetAddress, Long>();
	private DatagramSocket server;

	private final Logger log = Logger.getLogger(getClass().getName());

	public TorrentServer() throws IOException {
		this.server = new DatagramSocket(Config.DEFAULT_TORRENT_SERVER_PORT);
		Config.setLogHandler(log, getClass());
		log.info("Torrent server started at port " +
				Config.DEFAULT_TORRENT_SERVER_PORT);
	}

	public void run() {
		while (true) {
			byte[] req = new byte[MAX_REQUEST_SIZE];
			DatagramPacket udpRequest = new DatagramPacket(req, req.length);
			try {
				// wait for requests from clients
				server.receive(udpRequest);
				// ignore if bad request
				if (this.handleBadRequest(udpRequest)) continue;
				// else record request with grading server
				GradingServer.testingMap.processRequest(new String(
						udpRequest.getData()));
				// ignore if rate-limited
				if (this.repliedRecently(udpRequest.getAddress())) continue;
				// else send response
				this.sendResponse(this.makeResponse(udpRequest).getBytes(),
					udpRequest);
				// sleep for the duration
				this.lastReq.put(udpRequest.getAddress(),
					System.currentTimeMillis());
				// Thread.sleep(Config.DEFAULT_INTER_TORRENT_DELAY);
			} catch (IOException e) {
				log.severe("Exception in torrent request from " +
						udpRequest.getAddress() + ":" + udpRequest.getPort());
				e.printStackTrace();
			}
		}
	}

	/********************** Private methods below *************************/

	// send bad format response if needed
	private boolean handleBadRequest(DatagramPacket udpRequest)
			throws IOException {
		String request = (new String(udpRequest.getData())).trim();
		boolean bad = false;
		if (!FileManager.isLegitRequest(request)) {
			bad = true;
			log.info("Received bad request <" + request + "> from " +
					udpRequest.getAddress() + ":" + udpRequest.getPort());
			// send back error response
			byte[] buf =
					(Config.StatusCode.BAD_FORMAT.getStatusCode() + "\n").getBytes();
			server.send(new DatagramPacket(buf, buf.length,
					udpRequest.getAddress(), udpRequest.getPort()));
		}
		else if (this.handleUnregisteredTestingRequest(request,
			udpRequest.getAddress(), udpRequest.getPort())) {
			bad = true;
		}
		return bad;
	}

	private boolean handleUnregisteredTestingRequest(String request,
			InetAddress iaddr, int port) throws IOException {
		boolean unreg = false;
		if (FileManager.isLegitTestingRequest(request) &&
				(GradingServer.getScrambledFile(request) == null)) {
			unreg = true;
			byte[] buf =
					((Config.StatusCode.BAD_FORMAT.getStatusCode() + ": " + GradingServer.NO_TEST_INITIATED_MESSAGE)).getBytes();
			server.send(new DatagramPacket(buf, buf.length, iaddr, port));
		}
		return unreg;
	}

	private Integer[] getAllPorts() {
		Integer[] ports =
				FileServer.getSharedInfo().getPorts().toArray(new Integer[0]);
		if (ports == null || ports.length == 0)
			ports = FileServer.DEFAULT_SERVER_PORTS;
		return ports;
	}

	private int[] getRandomPorts() {
		Integer[] allPorts = this.getAllPorts();
		int[] rndPorts = new int[2];
		rndPorts[0] = allPorts[(int) (Math.random() * allPorts.length)];
		do
			rndPorts[1] = allPorts[(int) (Math.random() * allPorts.length)];
		while (rndPorts[0] == rndPorts[1]);

		return rndPorts;
	}

	private String makeResponse(DatagramPacket udpRequest)
			throws UnknownHostException {
		String request = (new String(udpRequest.getData())).trim();
		int fileSize =
				(int) (new File(
						Config.DEFAULT_RESOURCES_DIR +
								FileManager.getScrambledFile(request).getOriginalFilename())).length();
		int numBlocks = (int) ((fileSize / Config.DEFAULT_BLOCK_SIZE) + 1);

		log.info(new Date() + " Received request " + request + " from " +
				udpRequest.getAddress() + ":" + udpRequest.getPort());

		int[] ports = this.getRandomPorts();

		String newResponse = Config.getTorrentResponseFormat();
		InetAddress myAddr = this.getMyAddress();
		newResponse =
				String.format(newResponse, numBlocks, fileSize, myAddr,
					ports[0], myAddr, ports[1]);
		return newResponse;
	}

	private InetAddress getMyAddress() {
		try {
			return InetAddress.getLocalHost();
		} catch (UnknownHostException e) {
			try {
				return InetAddress.getByName("localhost");
			} catch (UnknownHostException e1) {
				e1.printStackTrace();
			}
		}
		return null;
	}

	private void sendResponse(byte[] buf, DatagramPacket udpRequest)
			throws IOException {
		DatagramPacket udpResponse =
				new DatagramPacket(buf, buf.length, udpRequest.getAddress(),
						udpRequest.getPort());
		log.info("Sending torrent response to " + udpResponse.getAddress() +
				":" + udpResponse.getPort());
		server.send(udpResponse);
		this.lastReq.put(udpRequest.getAddress(), System.currentTimeMillis());
	}

	private boolean repliedRecently(InetAddress iaddr) {
		Long time = this.lastReq.get(iaddr);
		if (time == null ||
				System.currentTimeMillis() - time > Config.DEFAULT_INTER_TORRENT_REQUEST_DELAY)
			return false;
		return true;
	}

	public static void main(String[] args) {
		TorrentServer ts = null;
		try {
			ts = new TorrentServer();
			ts.run();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
