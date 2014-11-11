import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.ServerSocket;
import java.net.Socket;

/**
@author V. Arun
 */

/* This class simply extends PersistentTCPServer to add support
 * for concurrent clients. There is no actual shared data 
 * structures between multiple threads, so there is no 
 * concurrency control problems to worry about in this example.
 * We simply added a private class SingleClientHandler that
 * simply invokes handleSingleClient to accomplish the goal.
 */
public class ThreadedPersistentTCPServer {

	private class SingleClientHandler implements Runnable {

		private final Socket connectionSocket;
		SingleClientHandler(Socket connectionSocket) {
			this.connectionSocket = connectionSocket;
		}
		@Override
		public void run() {
			try {
				/* In general, you may not be able to call handleSingleClient
				 * directly if this private class, SingleClientHandler, were
				 * in its own file. You need to pass it more arguments in 
				 * addition to connectionSocket for that purpose. 
				 * In general, it is a good idea to define a class in its 
				 * own separate file unless it is a really small class 
				 * that is used only (private-ly) inside a single file.
				 */
				handleSingleClient(connectionSocket);
			} catch (IOException e) {
				e.printStackTrace();
			} finally {
				try {
					this.connectionSocket.close();
				} catch (IOException e) {
					e.printStackTrace();
					// give up trying to close the socket at this point
				}
			}
		}
	}

	// Same as PersistentTCPServer.handleSingleClient(.)
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
		System.out.println("Closing client connection from " + 
				connectionSocket.getRemoteSocketAddress());
		connectionSocket.close();
	}
	
	private void startServer() throws IOException {
		ServerSocket welcomeSocket = new ServerSocket(6789);

		while(true)
		{
			Socket connectionSocket = welcomeSocket.accept();
			//this.handleSingleClient(connectionSocket);
			(new Thread(new SingleClientHandler(connectionSocket))).start();
		}
	}
	
	public static void main(String[] args) {
		ThreadedPersistentTCPServer server = new ThreadedPersistentTCPServer();
		try {
			server.startServer();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

}
