import java.io.*; 
import java.net.*; 

class UDPClient {
	private static final int DATA_SIZE = 200000;
	
	public static void main(String args[]) throws Exception 
	{ 

		BufferedReader inFromUser = 
				new BufferedReader(new InputStreamReader(System.in)); 

		DatagramSocket clientSocket = new DatagramSocket(); 

		InetAddress IPAddress = InetAddress.getByName("localhost"); 

		byte[] sendData = new byte[DATA_SIZE]; 
		byte[] receiveData = new byte[DATA_SIZE]; 

		String sentence = inFromUser.readLine();
		String original = sentence;
		
		while(sentence.length() < 0.9*DATA_SIZE) sentence += original;
		
		sendData = sentence.getBytes();         
		DatagramPacket sendPacket = 
				new DatagramPacket(sendData, sendData.length, 
					IPAddress, 9876); 

		clientSocket.send(sendPacket); 

		DatagramPacket receivePacket = 
				new DatagramPacket(receiveData, receiveData.length); 

		clientSocket.receive(receivePacket); 

		String modifiedSentence = 
				new String(receivePacket.getData()); 

		System.out.println("FROM SERVER:" + modifiedSentence); 
		clientSocket.close(); 
	} 
} 
