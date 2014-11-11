package gradingServer;

import java.util.HashSet;
import java.util.Set;

/**
@author V. Arun
 */
public class SharedServerInfo {
	private final Set<Integer> serverPorts = new HashSet<Integer>(); // current set of ports
	private final Set<Integer> deprecatedPorts = new HashSet<Integer>(); // to be removed soon

	public synchronized Set<Integer> getPorts() {
		return new HashSet<Integer>(this.serverPorts);
	}

	public synchronized boolean deprecatePort(int port) {
		if(this.serverPorts.remove(port)) {
			this.deprecatedPorts.add(port);
			return true;
		}
		return false;
	}
	public synchronized boolean addPort(int port) {
		if(this.deprecatedPorts.contains(port)) return false;
		return this.serverPorts.add(port);
	}
	public synchronized boolean addPorts(Set<Integer> ports) {
		boolean added = true;
		for(int port : ports)
			added = added || this.addPort(port);
		return added;
	}
	public synchronized boolean canAddPort(int port) {
		return !this.serverPorts.contains(port) && 
				!this.deprecatedPorts.contains(port);
	}
	public synchronized int getRandomListeningPort() {
		int index = (int)(Math.random()*this.serverPorts.size());
		return (int)(this.serverPorts.toArray()[index]);
	}
	public int getRandomNewPort() {
		int port=-1;
		// try random number between 1024 and 65535
		while(!canAddPort(port = 
				(int)(1024 + Math.random()*(65535 - 1024))));
		return port;
	}
}
