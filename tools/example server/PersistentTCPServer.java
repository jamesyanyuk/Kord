import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.ServerSocket;
import java.net.Socket;

/**
@author V. Arun
 */
public class PersistentTCPServer {

	/* Similar to TCPServer but with the difference that we need to handle
	 * possibly an arbitrary number of requests from each client.
	 */
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
		if(!connectionSocket.isClosed()) connectionSocket.close();        		
	}
	private void startServer() throws IOException {
		ServerSocket welcomeSocket = new ServerSocket(6789);

		while(true)
		{
			Socket connectionSocket = welcomeSocket.accept();
			try {
				this.handleSingleClient(connectionSocket);
			} catch (IOException ioe) {
				ioe.printStackTrace();
			} finally {
				// Always try your best to close everything
				if(!connectionSocket.isClosed()) connectionSocket.close();        		
			}
		}
	}
	public static void main(String[] args) {
		PersistentTCPServer server = new PersistentTCPServer();
		try {
			server.startServer();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

}
