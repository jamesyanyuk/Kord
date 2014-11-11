package pa1.autograding;

import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.logging.Logger;

import pa1.Config;
import pa1.FileManager;

/**
 * @author V. Arun
 */
/* This class scrambles the file with a randomly chosen
 * per-session nonce, so it is practically impossible
 * to guess the contents of the file. It leaves the 
 * size of the file unchanged. This scrambling allows
 * the grading server to test each student separately
 * with a different file and makes it near impossible
 * to answer the challenge unless their client has 
 * actually downloaded the file correctly.
 */
public class ScrambledFile {

	private final String filename;
	private final String id; // testing id
	protected final byte[] scrambler;
	private final byte[] file;

	private Logger log = Logger.getLogger(getClass().getName());

	public ScrambledFile(String filename, String id) {
		this.filename = filename;
		this.id = id;
		this.scrambler = getScrambler(id);
		this.file = FileManager.getMainBuffer(filename);
	}

	public byte[] getChunk(int offset, int length) {
		return this.getScrambledChunk(offset, length);
	}

	protected String getId() {
		return this.id;
	}

	public String getFilename() {
		return ((this.id != null && !this.id.isEmpty()) ? this.id +
				Config.DEFAULT_ID_FILENAME_SEPARATOR + this.filename
				: this.filename);
	}

	public int getFileSize() {
		return this.file.length;
	}

	public String getOriginalFilename() {
		return this.filename;
	}

	protected boolean verify(byte[] response) {
		if (response == null || response.length == 0) return false;
		byte[] xorChecksum =
				getXORChecksum(getScrambledChunk(0, this.file.length));

		boolean requestSeparator =
				new String(xorChecksum).matches(".*" +
						Config.DEFAULT_REQUEST_SPLITTER_REGEX);

		boolean checks = true;
		for (int i = 0; i < response.length; i++) {
			checks = checks && (response[i] == xorChecksum[i]);
		}

		log.info("checksum = " + ScrambledFile.getBytesAsInts(xorChecksum) +
				" ; submitted = " + ScrambledFile.getBytesAsInts(response));
		return checks &&
				(response.length == xorChecksum.length || requestSeparator);
	}

	/************** Private methods below **********************/
	public static byte[] getXORChecksum(byte[] bytes) {
		int checksumLength = Config.DEFAULT_CHALLENGE_RESPONSE_LENGTH; // default = 4
		if (bytes.length <= checksumLength) return bytes;
		byte[] checksum = new byte[checksumLength];
		for (int i = 0; i < checksumLength; i++) {
			checksum[i] = bytes[i];
			for (int j = checksumLength + i; j < bytes.length; j +=
					checksumLength) {
				checksum[i] = (byte) (checksum[i] ^ bytes[j]);
			}
		}
		return checksum;
	}

	public static String getBytesAsInts(byte[] buf) {
		String s = "";
		for (int i = 0; i < buf.length; i++) {
			s += ((int) (buf[i])) + ",";
		}
		return s;
	}

	private byte[] getOriginalChunk(int offset, int length) {
		byte[] chunk = Arrays.copyOfRange(this.file, offset, offset + length);
		return chunk;
	}

	private byte[] getScrambledChunk(int offset, int length) {
		byte[] buf = this.getOriginalChunk(offset, length);
		return scramble(buf, this.scrambler, offset);
	}

	private static byte[] scramble(byte[] buf, byte[] scrambler, int fileOffset) {
		if (scrambler == null || scrambler.length == 0 || fileOffset < 0)
			return buf;
		int index = fileOffset % scrambler.length;
		for (int i = 0; i < buf.length; i++) {
			index = index % scrambler.length;
			buf[i] = (byte) (buf[i] ^ scrambler[index++]);
		}
		return buf;
	}

	private static byte[] getScrambler(String id) {
		if (id == null || id.isEmpty()) return null;
		MessageDigest md = null;
		try {
			md = MessageDigest.getInstance("MD5");
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}
		byte[] digest =
				(md != null ? md.digest((id + System.nanoTime()).getBytes())
						: null);
		return digest;
	}

	public static void main(String[] args) {
		Integer id = 437123;
		byte[] digest = getScrambler(id.toString());
		System.out.println("Produced scrambler of length " + digest.length +
				": " + new String(digest));
		String text =
				"Scramble this sentence. After that, make an omlette out of it";
		byte[] scramble = scramble(text.getBytes(), digest, 0);
		assert (scramble.length == text.length());
		System.out.println("Generated scramble: " + new String(scramble) +
				"\nfrom original text: " + text);
		byte[] scramble2 = scramble(scramble, digest, 0);
		System.out.println("Scrambled scramble: " + new String(scramble));
		assert (scramble2.equals(scramble));

		ScrambledFile sf =
				new ScrambledFile(FileManager.filenames[0], id.toString());
		int fileOffset = 3456, length = Config.DEFAULT_BLOCK_SIZE;
		byte[] buf1 = sf.getScrambledChunk(fileOffset, length);
		byte[] buf2 = sf.getScrambledChunk(fileOffset, length);
		assert ((new String(buf1).equals(new String(buf2))));

		int randomBlockOffset =
				(int) (Math.random() * Config.DEFAULT_BLOCK_SIZE);
		byte[] response =
				Arrays.copyOfRange(buf1, randomBlockOffset,
					randomBlockOffset + 4);
		response = getXORChecksum(sf.getScrambledChunk(0, sf.getFileSize()));
		assert (sf.verify(response));

		byte[] checksum = new byte[Config.DEFAULT_CHALLENGE_RESPONSE_LENGTH];
		checksum =
				getXORChecksum("Always remember that you are unique. Just like everyone else.".getBytes());
		assert (checksum.length == 4);
		for (byte b : checksum)
			System.out.print(b + ",");
		try {
			System.out.println("[" + new String(checksum, "UTF-8") + "]");
		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
