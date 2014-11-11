import java.io.*; 
import java.net.*; 
  
class UDPServer { 
	public static int DATA_SIZE = 200000;

  public static void main(String args[]) throws Exception 
    { 
  
      DatagramSocket serverSocket = new DatagramSocket(9876); 
  
      byte[] receiveData = new byte[DATA_SIZE]; 
      byte[] sendData  = new byte[DATA_SIZE]; 
  
      while(true) 
        { 
  
          DatagramPacket receivePacket = 
             new DatagramPacket(receiveData, receiveData.length); 
           serverSocket.receive(receivePacket); 

           String sentence = new String(receivePacket.getData()); 
   
           InetAddress IPAddress = receivePacket.getAddress(); 
   
           int port = receivePacket.getPort(); 
   
                       String capitalizedSentence = sentence.toUpperCase(); 

           sendData = capitalizedSentence.getBytes(); 
   
           DatagramPacket sendPacket = 
              new DatagramPacket(sendData, sendData.length, IPAddress, 
                                port); 
   
           serverSocket.send(sendPacket); 
         } 
     } 
 }  
