package gradingServer;

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

import gradingServer.BlockRequest;

/**
 * @author V. Arun
 */
/* This class schedules blocks (or the whole) file. It 
 * implements the logic for rate-limiting by sending
 * small portions of the block and pausing in between.
 */
public class BlockTransportScheduler implements Runnable {

	private static final int MAX_QUEUE_SIZE = 128;

	private final AbstractNIOServer nioServer;
	private final PriorityBlockingQueue<BlockRequest> serviceQueue;
	private final Logger log = Config.setLogHandler(getClass());
	private boolean isRunnable = true;
	private final Timer timer = new Timer();

	public BlockTransportScheduler(AbstractNIOServer nioServer) {
		this.nioServer = nioServer;
		this.serviceQueue =
				new PriorityBlockingQueue<BlockRequest>(MAX_QUEUE_SIZE,
						new BlockRequestComparator());
		this.isRunnable = true;
		log.info("Initiated " + getClass().getName());
	}

	public BlockTransportScheduler() {
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
					req2.getCreationTime()); // assumes unique creation times
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
		final BlockTransportScheduler manager;

		Notifier(BlockTransportScheduler manager) {
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
		timer.schedule(new Notifier(this), delay);
	}

	synchronized private BlockRequest pollNext() {
		return !this.serviceQueue.isEmpty() &&
				(this.serviceQueue.peek().getNextScheduledTime() <= System.currentTimeMillis()) ? this.serviceQueue.poll()
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

	private boolean closeChannel(SocketChannel sockChannel) {
		if (this.nioServer != null) // graceful close
			return this.nioServer.closeClientChannel(sockChannel);
		else return closeChannelRaw(sockChannel);
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
				Config.HeaderFields.BODY_BYTE_OFFSET_IN_FILE.toString() + ": " +
				chunkOffset + "\n" +
				Config.HeaderFields.BODY_BYTE_LENGTH.toString() + ": " +
				chunkLength + "\n" + "\n";
	}

	public void run() {
		while (this.isRunnable) {
			this.scheduleNotification(); // in case wait happens below
			BlockRequest blockReq = waitForEvent();
			assert (blockReq != null);

			// connection closed
			if (!blockReq.getSock().isOpen() || !blockReq.getSock().isConnected()) {
				log.info("Client closed socket on " + blockReq.getSock());
				continue; // no need to re-deposit request
			}

			// all done with request
			if (blockReq.getNextWriteSize() == 0) {
				blockReq.setFinished(true);
				log.info((blockReq.isFullRequest() ? "Full file " +
						blockReq.getFile().getFilename() : "Block " +
						blockReq.getBlockId()) +
						" sent to client on " + blockReq.getSock());
				continue; // do not redeposit
			}
			
			// out-of-range request, close connection
			if(blockReq.getNextWriteSize() <0) {
				log.info("Out-of-bounds request starting at " +
					blockReq.getStartByte() + " for file " +
					blockReq.getFile().getFilename());
				closeChannel(blockReq.getSock());
			}
			
			// service typical legitimate request
			this.serviceRequest(blockReq);
		}
	}

	// legitimate request or part thereof
	private void serviceRequest(BlockRequest blockReq) {
		try {
			// write header if new
			if (blockReq.isNew()) this.writeHeader(blockReq);
			if (blockReq.isHeaderOnly()) return; // don't redeposit
			// write body part
			this.writeNextFewBytes(blockReq);
			// re-deposit remaining part
			deposit(blockReq.setNextServiceTime(System.currentTimeMillis() +
					blockReq.getDuration()));
		} catch (IOException e) {
			// most likely coz client closed connection
			log.info("Client socket exception on " + blockReq.getSock());
			closeChannel(blockReq.getSock());
		}		
	}

	private int writeHeader(BlockRequest req) throws IOException {
		req.setNewRequest(false);
		int offset = req.getStartByte();
		int bodyLength = req.getTotalWriteSize();
		int numWritten = 0;
		ByteBuffer buf =
				ByteBuffer.wrap(this.makeHeader(offset, bodyLength).getBytes());
		while (buf.hasRemaining())
			numWritten += req.getSock().write(buf);
		return numWritten;
	}

	private int writeNextFewBytes(BlockRequest req) throws IOException {
		byte[] nextWrite =
				req.getFile().getChunk(req.getStartByte(),
					req.getNextWriteSize());
		int numWritten = req.getSock().write(ByteBuffer.wrap(nextWrite));
		req.setStartByte(req.getStartByte() + numWritten);
		return numWritten;
	}
}
