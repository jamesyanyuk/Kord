package gradingServer;

import java.net.*;
import java.nio.channels.*;

import gradingServer.Config;
import gradingServer.ScrambledFile;

/**
 * @author V. Arun
 * 
 */
public class BlockRequest {

	private static final long PRE_TRANSMISSION_DELAY = 1000; // every block has this initial delay
	private static long maxCreationTime = System.currentTimeMillis(); // helps assign unique creation times

	// final
	private final ScrambledFile file;
	private final int blockID;
	private final long creationTime;
	private final SocketChannel sock;
	private final long pauseDuration;
	private final boolean headerOnly;

	// non-final
	private int byteStart; // changes with each rate-limited write
	private long nextScheduledTime; // for next rate-limited write
	private boolean newRequest; // true until first write
	private boolean finishedRequest; // false until all done

	public BlockRequest(int blockID, SocketChannel sock, long duration,
			ScrambledFile file, boolean headerOnly) {
		super();
		this.blockID = blockID;
		this.byteStart =
				(isFullRequest() ? 0 : blockID * Config.DEFAULT_BLOCK_SIZE);
		this.creationTime = updateCreationTime();
		this.nextScheduledTime = this.creationTime + PRE_TRANSMISSION_DELAY;
		this.sock = sock;
		this.pauseDuration = duration;
		this.newRequest = true;
		this.finishedRequest = false;
		this.file = file;
		this.headerOnly = headerOnly;

	}

	public BlockRequest(int blockID, long time, SocketChannel sock,
			long duration, ScrambledFile file) {
		this(blockID, sock, duration, file, false);
	}

	public ScrambledFile getFile() {
		return this.file;
	}

	public int getPort() {
		return this.sock.socket().getPort();
	}

	public InetAddress getAddress() {
		return this.sock.socket().getInetAddress();
	}

	public boolean isFinished() {
		return finishedRequest;
	}

	public void setFinished(boolean finished) {
		this.finishedRequest = finished;
	}

	public boolean isNew() {
		return newRequest;
	}

	public void setNewRequest(boolean newRequest) {
		this.newRequest = newRequest;
	}

	public int getBlockId() {
		return blockID;
	}

	public int getStartByte() {
		return byteStart;
	}

	public void setStartByte(int byteStart) {
		this.byteStart = byteStart;
	}

	public long getCreationTime() {
		return creationTime;
	}

	public SocketChannel getSock() {
		return sock;
	}

	public long getDuration() {
		return pauseDuration;
	}

	public BlockRequest setNextServiceTime(long t) {
		this.nextScheduledTime = t;
		return this;
	}

	public long getNextScheduledTime() {
		return this.nextScheduledTime;
	}

	public boolean isFullRequest() {
		return this.blockID == -1;
	}

	public boolean isBlockRequest() {
		return this.blockID >= 0;
	}

	public int getFileSize() {
		return this.file.getFileSize();
	}

	public boolean isLastBlock() {
		return (this.blockID + 1) * Config.DEFAULT_BLOCK_SIZE >= this.getFileSize();
	}

	public int getLastByte() {
		return (isFullRequest() || isLastBlock()) ? getFileSize()
				: (this.blockID + 1) * Config.DEFAULT_BLOCK_SIZE;
	}

	public int getNextWriteSize() {
		return Math.min(Config.DEFAULT_BYTES_PER_EVENT, getLastByte() -
				getStartByte());
	}

	public int getTotalWriteSize() {
		return isFullRequest() ? getFileSize() : Math.min(
			Config.DEFAULT_BLOCK_SIZE, getLastByte() - this.blockID *
					Config.DEFAULT_BLOCK_SIZE);
	}

	public boolean isHeaderOnly() {
		return this.headerOnly;
	}

	/*
	 * Need to make sure creation times are unique so that event
	 * comparator in ChannelQueueManager can deterministically
	 * pull out a unique request from the queue when there are
	 * multiple requests being sent over a connection.
	 */
	private synchronized static long updateCreationTime() {
		long time = System.currentTimeMillis();
		return (time > maxCreationTime ? (maxCreationTime = time)
				: (++maxCreationTime));
	}

	public static void main(String[] args) {
	}
}
