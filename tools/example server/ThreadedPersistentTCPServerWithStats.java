import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.ServerSocket;
import java.net.Socket;

/**
@author V. Arun
 */
/* This class extends ThreadedPersistentTCPServer to add support
 * for maintaining stats for the current and total number of 
 * clients. Doing this correctly requires handling concurrent
 * accesses to shared data structured correctly. We added a 
 * new private class ClientStatistics for this below.
 */
public class ThreadedPersistentTCPServerWithStats {

	/*************** Beginning of class ClientStatistics ********************/
	private class ClientStatistics {
		private int numCurrentClients=0;
		private int numTotalClients=0;

		/* All methods below are synchronized because they are 
		 * concurrently invoked by multiple threads.
		 */
		private synchronized void incrNumCurrentClients() {
			this.numCurrentClients++;
			this.numTotalClients++; // only increases, never decreases
		}
		private synchronized void decrNumCurrentClients() {
			this.numCurrentClients--;
		}
		private synchronized int getNumCurrentClients() {
			return this.numCurrentClients;
		}
		private synchronized int getNumTotalClients() {
			return this.numTotalClients;
		}

	}
	/*************** End of class ClientStatistics ********************/

	/*************** Beginning of class SingleClientHandler ********************/
	private class SingleClientHandler implements Runnable {
		private final Socket connectionSocket;
		private final ClientStatistics cStats;
		SingleClientHandler(Socket connectionSocket, ClientStatistics cStats) {
			this.connectionSocket = connectionSocket;
			this.cStats = cStats;
		}
		public void run() {
			try {
				handleSingleClient(this.connectionSocket);
			} 
			catch (IOException e) {
				e.printStackTrace();
			} 
			finally { // need to cleanly close sockets and adjust stats
				try {
					this.cStats.decrNumCurrentClients();
					System.out.println("#current_clients = " + cStats.getNumCurrentClients() + 
						"\n#total_clients = " + cStats.getNumTotalClients());
					this.connectionSocket.close();
				} catch (IOException e) {
					e.printStackTrace();
					// We give up trying to close the socket at this point 
				}
			}
		}
	}
	/*************** End of class SingleClientHandler ********************/

	private void handleSingleClient(Socket connectionSocket) throws IOException {
		BufferedReader inFromClient =
				new BufferedReader(new InputStreamReader(connectionSocket.getInputStream()));
		DataOutputStream outToClient = new DataOutputStream(connectionSocket.getOutputStream());

		while(!connectionSocket.isClosed()) {
			String clientSentence = inFromClient.readLine();
			if(clientSentence!=null)  { 
				System.out.println("Received: " + clientSentence);
				if(clientSentence.equals(".")) break;
				String capitalizedSentence = clientSentence.toUpperCase() + '\n';
				outToClient.writeBytes(capitalizedSentence);
			} 
		}		
		connectionSocket.close(); // exceptions will be thrown upward
	}
	
	private void startServer() throws IOException {
		ServerSocket welcomeSocket = new ServerSocket(6789);
		ClientStatistics cStats = new ClientStatistics();

		while(true)
		{
			Socket connectionSocket = welcomeSocket.accept();
			//this.handleSingleClient(connectionSocket);
			(new Thread(new SingleClientHandler(connectionSocket, cStats))).start();
			cStats.incrNumCurrentClients();
			cStats.decrNumCurrentClients();
			System.out.println("#current_clients = " + cStats.getNumCurrentClients() + 
				"\n#total_clients = " + cStats.getNumTotalClients());
		}
	}

	public static void main(String[] args) {
		ThreadedPersistentTCPServerWithStats server = new ThreadedPersistentTCPServerWithStats();
		try {
			server.startServer();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

}
