package pa1.deprecated;
import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map.Entry;
import java.util.Random;
import java.util.Set;
import java.util.TreeMap;
import java.util.logging.FileHandler;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.logging.SimpleFormatter;

import pa1.BlockTransportScheduler;
import pa1.Config;
import pa1.FileManager;
import pa1.autograding.ScrambledFile;
import pa1.util.BlockRequest;
import pa1.util.SharedServerInfo;

/**
 * @author Kana, V. Arun
 * 
 */
public class ChannelFileServer {

	private static final int FIXED_PORT = 18765;
	// Default ports
	private static final int[] DEFAULT_SERVER_PORTS = {FIXED_PORT, 
		9245, 6373, 3564, 1235, 6725, 2454, 2334, 8865, 7120, 9500, 
		9501, 9503, 9504, 9505, 9506, 9507, 9508, 9509, 9510, 9511, 
		9512, 9513, 9514, 9515, 9516, 9517, 9518, 9519, 9520, 9521, 
		}; 

	private static long lastMaintenanceTime = System.currentTimeMillis();
	private static long MAINTENANCE_INTERVAL = 3000; // ms

	private static final int SCALING_FACTOR = 500;
	private static final int getRandomServiceRate() {
		return (int)(Math.random()*SCALING_FACTOR);
	}
	
	private static final long DEPRECATION_DELAY = 5000; // ms
	private static final int MAX_REQUEST_SIZE = 128;

	private static final long SERVER_SELECT_TIMEOUT = 1;
	private static final long CLIENT_SELECT_TIMEOUT = 1;

	private BlockTransportScheduler manager;
	//private ServerSocketChannel serverChannel;
	private Selector serverSelector;
	private Selector channelSelector;
	private Logger log;
	private Handler logFile;

	private static final SharedServerInfo sharedInfo = new SharedServerInfo(); // Shared by TorrentServer
	// maps ports to server sockets
	private final HashMap<Integer,ServerSocketChannel> serverChannels = new  HashMap<Integer,ServerSocketChannel>();
	private final HashMap<ServerSocketChannel,Set<SocketChannel>> connChannels = new 
			HashMap<ServerSocketChannel,Set<SocketChannel>>(); 

	public ChannelFileServer() {
		(manager = new BlockTransportScheduler()).start();
		if(!initLogging()) shutdown();
		if(!initServers()) shutdown();
	}
	private void shutdown() {
		this.closeAllServers();
		this.manager.stop();
	}

	private void closeAllServers() {
		for(ServerSocketChannel serverChannel : this.serverChannels.values()) {
			closeServerChannel(serverChannel);
		}
	}

	private boolean initServers() {
		boolean initializedAllServers = false;
		boolean initializedSelectors = false;
		try {
			// Create the server selector
			serverSelector = Selector.open();
			// Create selector for client socket channels
			channelSelector = Selector.open();
			initializedSelectors = true;
		} catch (IOException e) {
			log.severe("Failed to initialize selectors: " + e.getMessage());
			e.printStackTrace();
		}

		if(initializedSelectors) {
			// Start servers at default ports registered with serverSelector
			for (int i = 0; i < DEFAULT_SERVER_PORTS.length; i++) {
				try{
					this.addServer(DEFAULT_SERVER_PORTS[i]);
				} catch (IOException e) {
					log.severe("Failed to initialize server at port " + 
							DEFAULT_SERVER_PORTS[i] +": " + e.getMessage());
					e.printStackTrace();
				} 
			}
		}
		initializedAllServers = true;
		log.info("Initialized servers on default ports");
		return initializedAllServers;
	}
	
	private boolean initLogging() {
		boolean initialized = false;
		// Create a logger
		log = Logger.getLogger(getClass().getName());
		log.setLevel(Level.ALL);
		try {
			logFile = new FileHandler("log/"+getClass().getName()+".log");
			logFile.setFormatter(new SimpleFormatter());
			log.addHandler(logFile);
			initialized=true;
		} catch (IOException e) {
			log.severe("Error creating log file");
		}
		return initialized;
	}

	private boolean openServer(int port) throws IOException {
		ServerSocketChannel ssChannel = ServerSocketChannel.open();
		ssChannel.configureBlocking(false);
		ssChannel.socket().bind(new InetSocketAddress(port));
		this.serverChannels.put(port, ssChannel);

		ssChannel.register(this.serverSelector, SelectionKey.OP_ACCEPT); 
		return true;
	}
	private boolean canAddServerPort(int port) {
		return sharedInfo.canAddPort(port);
	}
	private boolean addServer(int port) throws IOException {
		boolean added = false;
		if(this.canAddServerPort(port)) {
			added = this.openServer(port);
			if(port!=FIXED_PORT) sharedInfo.addPort(port);
		}
		return added;
	}

	private boolean removeServer(int port) {
		if(!this.serverChannels.containsKey(port)) return false;
		sharedInfo.deprecatePort(port);
		// Closing server socket does not affect extant connections
		this.deprecate(this.serverChannels.get(port));
		return true;
	}
	private TreeMap<Long,ServerSocketChannel> deprecated = new TreeMap<Long,ServerSocketChannel>();
	private void deprecate(ServerSocketChannel ssChannel) {
		this.deprecated.put(System.currentTimeMillis(), ssChannel);
	}
	private boolean canCloseDeprecatedServer(ServerSocketChannel sc, long deprecatedTime) {
		if(System.currentTimeMillis() - deprecatedTime < DEPRECATION_DELAY) return false;
		// check if ongoing requests are being serviced 
		if(this.manager.checkOngoing(this.connChannels.get(sc))) return false;
		return true;
	}
	private Set<Integer> closeDeprecatedServers() throws IOException {
		if(this.deprecated.isEmpty()) return null;
		Set<Integer> closed = new HashSet<Integer>();
		Iterator<Entry<Long, ServerSocketChannel>> iterator = this.deprecated.entrySet().iterator();
		while(iterator.hasNext()) {
			Entry<Long, ServerSocketChannel> entry = iterator.next();
			if(canCloseDeprecatedServer(entry.getValue(), entry.getKey())) {
				ServerSocketChannel ssc = entry.getValue();
				int port = ((InetSocketAddress)ssc.getLocalAddress()).getPort();
				ssc.close();
				closed.add(port);
				iterator.remove();
			}
			else break; // stop as all other (sorted) entries 
		}
		return closed;
	}

	private void addConnection(ServerSocketChannel ssChannel, SocketChannel connChannel) {
		Set<SocketChannel> connections = this.connChannels.get(connChannel);
		if(connections==null) connections = new HashSet<SocketChannel>();
		connections.add(connChannel);
		this.connChannels.put(ssChannel, connections);
	}
	private boolean removeConnection(SocketChannel connChannel) {
		if(!this.connChannels.containsKey(connChannel)) return false;
		Set<SocketChannel> connections = this.connChannels.get(connChannel);	
		return connections.remove(connChannel);
	}

	private void doMaintenanceActivities() throws IOException {
		if(!testAndSetMaintenanceTime()) return;
		int port = 0; String logMsg = "";
		
		// add random new port
		while(!addServer(port = sharedInfo.getRandomNewPort()));
		logMsg += ("Added new port " + port+"; ");
		
		// remove random existing port 
		while(!removeServer(port = sharedInfo.getRandomListeningPort()));
		logMsg += ("Deprecated existing port " + port+"; ");
		
		// try to close deprecated servers
		Set<Integer> closed = closeDeprecatedServers();
		logMsg += ("Tried closing deprecated servers, closed " + closed);
		
		log.info(logMsg);
	}
	
	private boolean testAndSetMaintenanceTime() {
		if(System.currentTimeMillis() - lastMaintenanceTime < MAINTENANCE_INTERVAL) return false;
		lastMaintenanceTime = System.currentTimeMillis();		
		return true;
	}

	public void run() {
		while (true) {
			try {

				// Wait for an accept request
				serverSelector.select(SERVER_SELECT_TIMEOUT);
				// Get list of selection keys with pending events
				Iterator<SelectionKey> it = serverSelector.selectedKeys().iterator();

				// Process each accept key
				while (it.hasNext()) 
				{
					// Get the selection key
					SelectionKey selKey = (SelectionKey) it.next();
					// Remove it from the list to indicate that it is being processed
					it.remove();
					// Check if it's a connection request
					if (selKey.isAcceptable()) {
						processServerAccept(selKey);
					}

				}

				// Wait for request from clients
				channelSelector.select(CLIENT_SELECT_TIMEOUT);
				Iterator<SelectionKey> iter = channelSelector.selectedKeys().iterator();
				while (iter.hasNext()) 
				{
					SelectionKey channelKey = (SelectionKey) iter.next();
					iter.remove();
					if (channelKey.isReadable()) {
						processClientRequest(channelKey);
					}

				}

				doMaintenanceActivities();

			} catch (Exception e) {
				System.out.println(e);
				log.severe("Error in normal operation" + e.toString());
				e.printStackTrace();
				continue;
			}
			Thread.yield();
		}
	}

	/*
	 * Method that handles connection accepts
	 */
	private void processServerAccept(SelectionKey selKey) throws IOException {
		// Get channel with connection request
		ServerSocketChannel server = (ServerSocketChannel) selKey.channel();

		// Accept the connection
		SocketChannel serviceSocketChannel = server.accept();
		serviceSocketChannel.configureBlocking(false);

		// Register the channel to read data
		serviceSocketChannel.register(channelSelector, SelectionKey.OP_READ, new StringBuffer(MAX_REQUEST_SIZE));
		this.addConnection(server, serviceSocketChannel);
	}

	/*
	 * Method that handles client requests
	 */
	private void processClientRequest(SelectionKey selKey)
			throws InterruptedException {
		SocketChannel service = (SocketChannel) selKey.channel();
		byte[] readFromChannel = new byte[MAX_REQUEST_SIZE];
		ByteBuffer buf = ByteBuffer.wrap(readFromChannel);


		// Clear the buffer and read bytes from socket
		buf.clear();

		InetAddress sAddress = service.socket().getInetAddress();
		int sPort = service.socket().getPort();

		try {

			int numBytesRead = service.read(buf);

			if(numBytesRead > 0) {
				String partRequest = new String(readFromChannel, 0, numBytesRead);
				StringBuffer sockBuf = ((StringBuffer)selKey.attachment()).append(partRequest); 


				if(partRequest.contains("\n")) {
					// execute substrings split by newline except for the last one
					String request = sockBuf.toString(); 
					String[] reqs = request.split("\n");
					for(int i=0; i<reqs.length-1; i++) {
						requestExecute(reqs[i], service, sAddress, sPort);
					}

					sockBuf.delete(0,sockBuf.capacity());

					// execute last split request if received with newline, else append to buffer
					if(partRequest.endsWith("\n")) {
						requestExecute(reqs[reqs.length-1], service, sAddress, sPort);
					}
					else {
						sockBuf.append(reqs[reqs.length-1]);
						log.info("Received partial request (without newline) <" + sockBuf.toString() + ">");
					}
				}
				else if (sockBuf.length() > MAX_REQUEST_SIZE) {
					log.info("Received too long a command from " + sAddress + ":" + sPort + ", closing connection");
					service.socket().close();
					service.close();
				}
			}
			else if(numBytesRead == -1)// End of stream
			{
				log.severe("Reached end of stream for " + sAddress + ":"
						+ sPort);
				service.socket().close();
				service.close();
			}
			//selKey.cancel(); // Note: canceling will cause the key to be deregistered upon the next select call

		} catch (IOException e) {

			log.severe("Exception while processing client request from "
					+ sAddress + ":" + sPort + " -->Closing connection");

			closeClientChannel(service);
		}

	}

	private void requestExecute(String request, SocketChannel service,
			InetAddress sAddress, int sPort) {

		request = request.replaceAll("\\r", "");

		if(!FileManager.isLegitRequest(request)) {
			log.info("Received bad request <" + request + "> of length " + request.length() +  " from " + sAddress + ":" + sPort);
			closeClientChannel(service);
			return;
		}

		ScrambledFile sFile = FileManager.getScrambledFile(request);

		log.info("Request from " + sAddress + ":" + sPort + " is <" + request + ">");

		// Find out the service rate for that port - using the index of  the port
		int port = service.socket().getLocalPort();
		int i;
		for (i = 0; i < DEFAULT_SERVER_PORTS.length; i++) {
			if (port == DEFAULT_SERVER_PORTS[i])
				break;
		}


		// Request to be generated
		BlockRequest req = null;

		if (FileManager.fullRequest(request)) {
			req = new BlockRequest(-1,
				(System.currentTimeMillis() + 3000), service,
				(getRandomServiceRate()),sFile);
		} 
		else if (FileManager.wildRequest(request)) {
			Random r = new Random(System.currentTimeMillis());
			int offset = r.nextInt((FileManager.getNumBlocks(sFile.getFilename()) - 1));
			++offset;
			req = new BlockRequest(offset,
				(System.currentTimeMillis() + 3000), service,
				(getRandomServiceRate()),sFile);
		} 
		else if (FileManager.blockRequest(request)) {
			String[] words = request.split("\\s+|" + 
					Config.DEFAULT_FILENAME_BLOCKNUM_SEPARATOR_REGEX);
			int offset = 0;
			try {
				offset = Integer.parseInt(words[2]);
			} catch (Exception e) {
				log.severe(e.getMessage());
				try {
					service.close();
				} catch (IOException e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				}

			}

			if (offset < 0 || offset > FileManager.getNumBlocks(sFile.getFilename())) {
				log.severe("Wrong offset request from " + sAddress + ":"
						+ sPort + " is " + request);
			} else {
				--offset;
				if (offset >= 0) {
					req = new BlockRequest(offset,
						(System
								.currentTimeMillis() + 3000), service,
								(getRandomServiceRate()),sFile);
				} else {
					// offset = -1, ie client requested block 0. The
					// response below returns the whole file. 
					req = new BlockRequest(-1, (System
							.currentTimeMillis() + 3000), service,
							(getRandomServiceRate()),sFile);
				}
			}
		} else {
			log.severe("Received bad request <" + request + "> of length " + request.length() +  " from " + sAddress + ":" + sPort);
			closeClientChannel(service);
		}
		if(req!=null) manager.deposit(req);
	}

	/*
	 * Method to close the channel
	 */

	private void closeClientChannel(final SocketChannel sockChannel) {
		try {
			this.removeConnection(sockChannel);
			sockChannel.socket().close();
			sockChannel.close();
		} catch (IOException e) {
			log.severe("Error while closing client channel:"
					+ sockChannel.socket().getInetAddress() + ":"
					+ sockChannel.socket().getPort() + e.getMessage());
		}
	}
	private void closeServerChannel(ServerSocketChannel serverChannel) {
		try {
			serverChannel.socket().close();
			serverChannel.close();
		} catch (IOException e) {
			log.severe("Error while closing server channel:"
					+ serverChannel.socket().getInetAddress() + ":"
					+ serverChannel.socket().getLocalPort() + e.getMessage());
			e.printStackTrace();
		}
	}

	public static Set<Integer> getServerPorts() {
		return sharedInfo.getPorts();
	}

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		ChannelFileServer s = new ChannelFileServer();
		//s.initialize();
		s.run();
	}

}
