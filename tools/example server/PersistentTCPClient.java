import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.Socket;

/**
@author V. Arun
 */
/* This class simply extends TCPClient to send an arbitrary
 * number of requests. It is a client that will work with 
 * all of the following: 
 *   PersistentTCPServer
 *   ThreadedPersistentTCPServer
 *   ThreadedPersistentTCPServerWithStats
 */
public class PersistentTCPClient {

	public static void main(String[] args) {
		try {
		  String sentence;
		  String modifiedSentence;
		  BufferedReader inFromUser = new BufferedReader( new InputStreamReader(System.in));
		  Socket clientSocket = new Socket("localhost", 6789);
		  DataOutputStream outToServer = new DataOutputStream(clientSocket.getOutputStream());
		  BufferedReader inFromServer = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));

		  /* This part is the main difference from TCPClient in that
		   * it sends an arbitrary number of requests, not just one,
		   * until the escape sequence is encountered.
		   */
		  while(true) {
			  sentence = inFromUser.readLine();
			  outToServer.writeBytes(sentence + '\n');
			  if(sentence.equals(".")) break;
			  modifiedSentence = inFromServer.readLine();
			  System.out.println("FROM SERVER: " + modifiedSentence);
		  }
		  clientSocket.close();
		} catch(IOException ioe) {
			ioe.printStackTrace();
		}
	}
}
