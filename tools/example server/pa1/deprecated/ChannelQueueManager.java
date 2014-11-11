package pa1.deprecated;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.SocketChannel;
import java.util.Comparator;
import java.util.Iterator;
import java.util.Set;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.PriorityBlockingQueue;
import java.util.logging.Logger;

import pa1.AbstractNIOServer;
import pa1.Config;
import pa1.util.BlockRequest;

/**
 * @author Kana, V. Arun
 * 
 */
public class ChannelQueueManager implements Runnable {

	private static final int BYTES_PER_EVENT = 1000;
	private static int HEADER_SIZE = 8;
	private static final int BLOCK_SIZE = Config.DEFAULT_BLOCK_SIZE;
	private static final int MAX_REQ_Q_SIZE = 128;

	private static enum HeaderFields {
		BYTE_OFFSET, BYTE_LENGTH
	};

	private final AbstractNIOServer nioServer;
	private final PriorityBlockingQueue<BlockRequest> serviceQueue;
	private final Logger log = Config.setLogHandler(getClass());
	private boolean isRunnable = true;
	private final Timer timer = new Timer();

	public ChannelQueueManager(AbstractNIOServer nioServer) {
		this.nioServer = nioServer;
		this.serviceQueue =
				new PriorityBlockingQueue<BlockRequest>(MAX_REQ_Q_SIZE,
						new BlockRequestComparator());
		this.isRunnable = true;
		log.info("Initiated " + getClass().getName());
	}

	public ChannelQueueManager() {
		this(null);
	}

	/******************* Beginning of private utility classes ************/
	/*********************************************************************/
	private class BlockRequestComparator implements
			Comparator<BlockRequest> {
		@Override
		public int compare(BlockRequest req1, BlockRequest req2) {
			if (req1.getSock().equals(req2.getSock()))
				// compare getTime()
				return this.compare(req1.getCreationTime(),
					req2.getCreationTime());
			else
			// compare getNextScheduledTime
			return this.compare(req1.getNextScheduledTime(),
				req2.getNextScheduledTime());
		}

		private int compare(long t1, long t2) {
			if (t1 < t2)
				return -1;
			else if (t1 == t2)
				return 0;
			else return 1;
		}
	}

	/*********************************************************************/
	private class Notifier extends TimerTask {
		final ChannelQueueManager manager;

		Notifier(ChannelQueueManager manager) {
			this.manager = manager;
		}

		public void run() {
			synchronized (manager) {
				manager.notify();
			}
		}
	}

	/*********************************************************************/
	/****** (*************** End of private utility classes ***************/

	public void start() {
		(new Thread(this)).start();
	}

	private synchronized long getNotificationDelay() {
		return !this.serviceQueue.isEmpty() ? Math.max(
			0,
			this.serviceQueue.peek().getNextScheduledTime() -
					System.currentTimeMillis()) : -1;
	}

	synchronized public void deposit(BlockRequest req) {
		this.serviceQueue.offer(req);
		this.scheduleNotification();
	}

	synchronized public void scheduleNotification() {
		if (this.serviceQueue.isEmpty()) return;
		long delay = this.getNotificationDelay();
		assert (delay >= 0);
		System.out.println("Scheduling notification after " + delay);
		timer.schedule(new Notifier(this), delay);
	}

	synchronized private BlockRequest pollNext() {
		return (!this.serviceQueue.isEmpty() && this.serviceQueue.peek().getCreationTime() <= System.currentTimeMillis()) ? this.serviceQueue.poll()
				: null;
	}

	synchronized private BlockRequest waitForEvent() {
		BlockRequest req = null;
		while ((req = pollNext()) == null)
			try {
				wait();
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		return req;
	}

	// to stop the thread
	public void stop() {
		this.isRunnable = false;
	}

	private boolean closeChannel(BlockRequest req) {
		return closeChannelRaw(req.getSock());
	}

	// FIXME: deprecated way of directly closing connection
	private boolean closeChannelRaw(SocketChannel sockChannel) {

		boolean closed = false;
		try {
			sockChannel.socket().close();
			sockChannel.close();
			closed = true;
		} catch (IOException e) {
			log.severe("Error while closing channel:" +
					sockChannel.socket().getInetAddress() + ":" +
					sockChannel.socket().getPort() + e.getMessage());
		}
		return closed;
	}

	public boolean checkOngoing(Set<SocketChannel> connChannels) {
		if (connChannels == null || connChannels.isEmpty()) return false;
		boolean ongoing = false;
		for (SocketChannel connChannel : connChannels) {
			ongoing = ongoing || checkOngoing(connChannel);
		}
		return ongoing;
	}

	private synchronized boolean checkOngoing(SocketChannel connChannel) {
		boolean ongoing = false;
		// check ongoing requests in priority queue
		Iterator<BlockRequest> iterator = serviceQueue.iterator();
		while (iterator.hasNext()) {
			BlockRequest req = iterator.next();
			if (req.getSock() == connChannel) {
				ongoing = true;
			}
		}
		return ongoing;
	}

	private String makeHeader(int chunkOffset, int chunkLength) {
		return Config.StatusCode.OK.getStatusCode() + "\n" +
				HeaderFields.BYTE_OFFSET.toString() + ": " + chunkOffset +
				"\n" + HeaderFields.BYTE_LENGTH.toString() + ": " +
				chunkLength + "\n" + "\n";
	}

	public void run() {
		while (this.isRunnable) {
			this.scheduleNotification(); // in case wait happens below
			BlockRequest req = waitForEvent();
			assert (req != null);

			if (!req.getSock().isOpen() || !req.getSock().isConnected()) {
				log.info("Client closed socket on " + req.getSock());
				continue;
			}

			if (getNumBytes(req) == 0) {
				req.setFinished(true);
				log.fine((req.isFullRequest() ? "Full file" : "Block " +
						req.getBlockId()) +
						" sent to client on " + req.getSock());
			}

			int offset = req.getStartByte();

			try {
				// Either last block or whole file
				// transmission is complete.

				// If requesting individual block and offset
				// exceeds end of block. Note that a whole
				// file request has blockID = -1.

				// Normal case: part of block or file to
				// be transmitted according to rate
				// limits.
				// Beginning of new block
				// transmission. Send header first.
				if (req.isNew()) {
					byte[] header = new byte[HEADER_SIZE];
					// Write byte offset into header
					int hdrOffset =
							(req.isFullRequest()) ? 0 : req.getBlockId() *
									BLOCK_SIZE;
					Utility.intToByteArray(hdrOffset, header, 0);

					int blockLength = 0;
					// Write length of block into
					// header.
					if (req.getBlockId() == -1) // Full file case
					{
						Utility.intToByteArray(req.getFile().getFileSize(),
							header, 4);
						blockLength = req.getFile().getFileSize();
					}
					else // Block by block case
					{
						// Last Segment is not full size
						if ((offset + BLOCK_SIZE) > req.getFile().getFileSize()) {
							int difference =
									req.getFile().getFileSize() - offset;
							Utility.intToByteArray(difference, header, 4);
							blockLength = difference;
						}
						else {
							Utility.intToByteArray(BLOCK_SIZE, header, 4);
							blockLength = BLOCK_SIZE;
						}
					}
					req.setNewRequest(false);
					header = this.makeHeader(hdrOffset, blockLength).getBytes();
					ByteBuffer buf = ByteBuffer.wrap(header);
					// Write header to socket.
					req.getSock().write(buf);
				}

				int numBytes = getNumBytes(req);

				// Write numBytes to socket.
				byte[] oneShot = req.getFile().getChunk(offset, numBytes); // new byte[numBytes];
				// System.arraycopy(req.getMainBuf(), offset, oneShot, 0, numBytes);
				ByteBuffer buf = ByteBuffer.wrap(oneShot);
				req.getSock().write(buf);
				req.setStartByte(offset + numBytes);

				// Put back req on queue as all bytes
				// may not yet have been written to
				// the socket due to the rate limit.
				req.setNextServiceTime(System.currentTimeMillis() +
						req.getDuration());
				deposit(req);
			} catch (Exception e) {
				log.severe("Client Socket exception for " +
						req.getSock().socket().getInetAddress() + ":" +
						req.getSock().socket().getPort() + e.getMessage());
				e.printStackTrace();
				closeChannel(req);
				continue;
			}
		}
	}

	private int getNumBytes(BlockRequest req) {

		int limit =
				((req.getBlockId() == -1) || ((req.getBlockId() + 1) *
						BLOCK_SIZE > req.getFile().getFileSize())) ? req.getFile().getFileSize()
						: ((req.getBlockId() + 1) * BLOCK_SIZE);

		int numBytes =
				req.getStartByte() + BYTES_PER_EVENT <= limit ? BYTES_PER_EVENT
						: limit - req.getStartByte();

		return numBytes;
	}

}
