package gradingServer;

import java.nio.channels.SocketChannel;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

/**
 * @author V. Arun
 */

/* This class is not really used actively. Much of this type 
 * of functionality is subsumed by the autograding package.
 * This class could be useful for limiting say the number 
 * of connections per IP as it uses IP as the ID instead
 * of the testingID in the autograding package.
 */
public class ClientStateMap {
	private final HashMap<String, ClientState> clientMap =
			new HashMap<String, ClientState>();

	private class ClientState {
		private static final int MAX_CONNECTIONS = 5;

		private final String ID; // generally the client IP address
		private final Set<SocketChannel> sockChannels =
				new HashSet<SocketChannel>();

		ClientState(String id) {
			this.ID = id;
		}

		synchronized boolean setOpen(SocketChannel sc) {
			if (this.sockChannels.size() < MAX_CONNECTIONS) {return this.sockChannels.add(sc); }
			return false;
		}

		synchronized boolean setClosed(SocketChannel sc) {
			return this.sockChannels.remove(sc);
		}

		synchronized boolean isAcceptable() {
			return this.sockChannels.size() < MAX_CONNECTIONS;
		}
		
		synchronized boolean isEmpty() {
			return this.sockChannels.isEmpty();
		}

		public synchronized String toString() {
			return this.ID + " : " + this.sockChannels;
		}
	}

	public synchronized boolean register(SocketChannel sockChannel) {
		String id = sockChannel.socket().getInetAddress().getHostAddress();
		if (id != null) {
			boolean registered = this.getOrCreateClientState(id).setOpen(sockChannel);
			assert(this.clientMap.size()>0 && this.clientMap.get(id).sockChannels.size()>0);
			return registered;
		}
		return false;
	}

	public synchronized boolean unRegister(SocketChannel sockChannel) {
		String id = sockChannel.socket().getInetAddress().getHostAddress();
		if (id == null) return false;
		ClientState state = this.clientMap.get(id);
		if (state == null) return false;
		boolean unregistered = state.setClosed(sockChannel);
		if(state.isEmpty()) this.clientMap.remove(id);
		return unregistered;
	}

	public synchronized boolean isAcceptable(String ip) {
		return (this.clientMap.containsKey(ip) ? this.clientMap.get(ip).isAcceptable()
				: true);
	}

	public synchronized void processRequest(String ip, String request) {
		// do nothing for now
	}

	public synchronized ClientState getOrCreateClientState(String id) {
		ClientState cState = this.clientMap.get(id);
		if (cState == null) {
			cState = new ClientState(id);
			this.clientMap.put(id, cState);
		}
		return cState;
	}

	public synchronized String toString() {
		String s = "";
		for (Iterator<String> iter = this.clientMap.keySet().iterator(); iter.hasNext();) {
			s += (this.clientMap.get(iter.next()) + "\n");
		}
		return s;
	}
}
