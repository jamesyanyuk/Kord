package gradingServer;

import java.io.ByteArrayOutputStream;
import java.io.File;
import javax.imageio.stream.FileImageInputStream;

import gradingServer.ScrambledFile;

/* This file mainly contains static utility methods 
 * related to file IO and checking if requests are
 * correctly formatted.
 */
public class FileManager {

	public static final String[] filenames = { "redsox.jpg", "test.jpg" };

	private static final byte[][] mainBuffers;
	static {
		mainBuffers = new byte[filenames.length][];
		mainBuffers[0] = loadImageFile(filenames[0]);
		mainBuffers[1] = loadImageFile(filenames[1]);
	}

	public static String getChallengeFilename() {
		return filenames[0];
	}

	protected static int getChallengeFileSize() {
		return mainBuffers[0].length;
	}

	public static int getNumBlocks(String filename) {
		for (int i = 0; i < filenames.length; i++) {
			if (filename.equals(filenames[i])) return mainBuffers[i].length;
		}
		return 0;
	}

	public static boolean isLegitRequest(String request) {
		return isLegit(request, false);
	}

	public static boolean isLegitTestingRequest(String request) {
		return isLegit(request, true);
	}

	public static boolean isLegit(String request, boolean testing) {
		for (String name : filenames) {
			if (request.toLowerCase().trim().matches(
				"(" + Config.Commands.GET.toString().toLowerCase() + "|" +
						Config.Commands.GETHDR.toString().toLowerCase() + ")" +
						"\\s+(\\d+" + Config.DEFAULT_ID_FILENAME_SEPARATOR +
						")" + (testing ? "" : "?") + name +  
						"((\\s*:\\s*(\\d*|\\*))|(\\.torrent))?" + "(\\s+\\d+)?")) return true;
		}
		return false;
	}
	public static boolean isLegitTorrentRequest(String request) {
		return isLegitRequest(request) && request.contains(".torrent");
	}

	public static String getTestingID(String request) {
		if (isLegitTestingRequest(request)) {
			assert (request.trim().split("\\s+").length >= 2);
			return request.trim().split("\\s+")[1].replaceAll("_.*", "");
		}
		return null;
	}

	public static ScrambledFile getScrambledFile(String request) {
		if (!isLegitRequest(request)) return null;
		String testingID = getTestingID(request);
		String filename = getFilename(request);
		return new ScrambledFile(filename, testingID);
	}

	public static int getChunkNumber(String request) {
		if (isLegitRequest(request)) {
			String[] tokens =
					request.split(Config.DEFAULT_FILENAME_BLOCKNUM_SEPARATOR_REGEX);
			if (request.contains(Config.DEFAULT_FILENAME_BLOCKNUM_SEPARATOR_STRING)) {
				return Integer.valueOf(tokens[1].trim());
			}
			else if (request.contains(Config.DEFAULT_WILDCARD_BLOCKNUM_STRING))
				return (int) (Math.random() * getNumBlocks(getFilename(request)));
		}
		return -1;
	}

	public static byte[] getMainBuffer(String req) {
		for (int i = 0; i < filenames.length; i++) {
			if (req.toLowerCase().contains(filenames[i].toLowerCase()))
				return mainBuffers[i];
		}
		return null;
	}

	public static String getFilename(String req) {
		for (int i = 0; i < filenames.length; i++) {
			if (req.toLowerCase().contains(filenames[i].toLowerCase()))
				return filenames[i];
		}
		return null;
	}

	public static boolean hasFilename(String req) {
		for (int i = 0; i < filenames.length; i++) {
			if (req.toLowerCase().contains(filenames[i].toLowerCase()))
				return true;
		}
		return false;
	}

	public static boolean fullRequest(String req) {
		for (int i = 0; i < filenames.length; i++) {
			if (req.toLowerCase().matches(
				Config.Commands.GET.toString().toLowerCase() + "\\s+" +
						filenames[i].toLowerCase() + "\\s*(\\s+\\d+)?\n*"))
				return true;
		}
		return false;
	}

	public static boolean blockRequest(String req) {
		for (int i = 0; i < filenames.length; i++) {
			if (req.toLowerCase().matches(
				Config.Commands.GET.toString().toLowerCase() + "\\s+" +
						filenames[i].toLowerCase() + "\\s*" +
						Config.DEFAULT_FILENAME_BLOCKNUM_SEPARATOR_REGEX +
						"\\s*\\d+\\s*(\\s+\\d+)?\n*")) { return true; }
		}
		return false;
	}

	public static boolean isHeaderRequest(String request) {
		return isLegitRequest(request) &&
				request.toLowerCase().contains(
					Config.Commands.GETHDR.toString().toLowerCase());
	}

	// Deprecated method
	public static boolean wildRequest(String req) {
		for (int i = 0; i < filenames.length; i++) {
			if (req.toLowerCase().matches(
				Config.Commands.GET.toString().toLowerCase() + "\\s+" +
						filenames[i].toLowerCase() + "\\s*:\\s*" +
						Config.DEFAULT_WILDCARD_BLOCKNUM_REGEX +
						"\\s*(\\s+\\d+)?\n*")) return true;
		}
		return false;
	}

	private static byte[] loadImageFile(String fileName) {
		byte[] data = new byte[1];
		try {
			FileImageInputStream input =
					new FileImageInputStream(new File(
							Config.DEFAULT_RESOURCES_DIR + fileName));
			ByteArrayOutputStream output = new ByteArrayOutputStream();
			byte[] buf = new byte[1024];
			int numBytesRead = 0;
			while ((numBytesRead = input.read(buf)) != -1) {
				output.write(buf, 0, numBytesRead);
			}
			data = output.toByteArray();
			output.close();
			input.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return data;
	}

	public static void main(String[] args) {
		System.out.println(FileManager.filenames[0] + " has " +
				FileManager.mainBuffers[0].length + " bytes.");
		System.out.println(FileManager.filenames[1] + " has " +
				FileManager.mainBuffers[1].length + " bytes.");

		assert (FileManager.fullRequest("GET  	 Redsox.jpg\n"));
		assert (FileManager.fullRequest("GET   Redsox.jpg"));
		assert (FileManager.fullRequest("GET  Redsox.jpg  \n\n"));

		assert (FileManager.blockRequest("GET  	 Redsox.jpg:3\n"));
		assert (FileManager.blockRequest("GET  	 Redsox.jpg:3459\n"));

		assert (FileManager.wildRequest("GET  	 Redsox.jpg:*\n"));

		assert (FileManager.isLegitRequest("GET   Redsox.jpg"));
		assert (FileManager.isLegitRequest("GET  	 Redsox.jpg:3459\n"));
		assert (FileManager.isLegitRequest("GET  	 Redsox.jpg:*\n"));
		assert (FileManager.isLegitRequest("GET test.jpg:3"));

		assert (FileManager.hasFilename(" 3232 Redsox.jpg fdfsd"));
		assert (FileManager.hasFilename("  test.jpg   fdfsd"));

		String s = FileManager.getFilename("GET Redsox.jpg.torrent\n");
		assert (s.equals(FileManager.filenames[0]));

		assert (isLegitRequest("GET redsox.jpg "));
		assert (isLegitRequest("gET redsox.jpg"));
		assert (isLegitRequest(" get redsox.jpg"));
		assert (isLegitRequest("get redsox.jpg:*"));
		assert (isLegitRequest("get redsox.jpg:25"));
		assert (!isLegitRequest("get redsox.jpg 25*"));
		assert (isLegitRequest("get 123_redsox.jpg "));
		assert (isLegitRequest("get 123_redsox.jpg: *"));
		assert (isLegitRequest("get 123_redsox.jpg:33"));
		assert (getTestingID("get 123_redsox.jpg: 33").equals("123"));
		assert (getTestingID("get 123_redsox.jpg").equals("123"));
		
		assert(isLegitTorrentRequest("get 12345_redsox.jpg.torrent"));
		assert(isLegitRequest("get 12345_redsox.jpg.torrent"));
		assert(isLegitTestingRequest("get 12345_redsox.jpg.torrent"));

		assert(FileManager.getChunkNumber("get redsox.jpg :  24")==24);

		System.out.println("Success: No assertion violations");

	}
}
