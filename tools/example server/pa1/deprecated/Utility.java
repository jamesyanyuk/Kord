package pa1.deprecated;

import java.io.*;
import java.util.*;

import javax.imageio.stream.FileImageOutputStream;


/**
 * @author Kana
 *
 */
public class Utility {
	
	 /*
	 * Method to convert an byteArray to integer
	 * start indicates the offset into the buffer from where conversion begins
	 */
	 
	public static int byteArrayToInt(byte[] buffer,int start)
	{
		int number = ((buffer[start] & 0xFF) << 24)
		| ((buffer[start+1] & 0xFF) << 16)
		| ((buffer[start+2] & 0xFF) << 8)
		| (buffer[start+3] & 0xFF);
		return number;
	}

	/*
	 * Method to convert an int to ByteArray
	 * start indicates the offset into the buffer from where conversion begins
	 */
	public static void intToByteArray(int number,byte[] buffer,int start)
	{
		buffer[start]=(byte)((number & 0xff000000)>>>24); 
		buffer[start+1]=(byte)((number & 0x00ff0000)>>>16); 
		buffer[start+2]=(byte)((number & 0x0000ff00)>>>8);  
		buffer[start+3]=(byte)((number & 0x000000ff));      

	}
	
	public static void makePictureFile(String fileName,byte[] source)
	{
		try
		{
			FileImageOutputStream imageOutput = new FileImageOutputStream(new File(fileName));
			imageOutput.write(source, 0, source.length);
			imageOutput.close();
		}
		catch(Exception e)
		{
			System.out.println("Unable to get picture");
			e.printStackTrace();
		}
	}
	public static void main(String[] args) {
		System.out.println("Hello\r\n".matches(".*\r\n"));
	}
}
