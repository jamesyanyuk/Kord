package pa1.deprecated;


import pa1.AbstractNIOServer;
import pa1.Config;

/**
@author V. Arun
 */
public class ChannelBuffer {
	private StringBuffer sbuffer=new StringBuffer(AbstractNIOServer.DEFAULT_MAX_REQUEST_SIZE);
	private byte[] bbuffer = new byte[AbstractNIOServer.DEFAULT_MAX_REQUEST_SIZE];
	private int index=0;
	
	public StringBuffer append(String s) {
		this.sbuffer.append(s);
		return this.sbuffer;
	}
	
	public ChannelBuffer append(byte[] buf) {
		for(byte b : buf) {
			this.bbuffer[index++] = b;
		}
		return this;
	}
	
	public void clear() {
		this.sbuffer.delete(0, this.sbuffer.capacity());
		for(int i=0; i<this.bbuffer.length; i++) {
			this.bbuffer[i] = 0;
		}
		index = 0;
	}
	
	public String toString() {
		return this.sbuffer.toString();
	}
	
	public boolean isChallengeResponse() {
		if(index==Config.DEFAULT_CHALLENGE_RESPONSE_LENGTH+Config.DEFAULT_REQUEST_SPLITTER_STRING.length() && 
				this.bbuffer[index-1]=='\n') {
			return true;
		}
		return false;
	}
}
