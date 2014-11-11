package gradingServer;

import java.io.IOException;

import gradingServer.GradingServer;

/**
 * @author V. Arun
 */
/*
 * The main class that starts FileServer, TorrentServer,
 * and GradingServer.
 */
public class Main {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		boolean testing = (args.length > 0 && args[0].equals("-t"));
		if (testing)
			Config.setStretchDuration(Config.DEFAULT_TESTING_STRETCH_DURATION);

		try {
			TorrentServer torrentServer = new TorrentServer();
			(new Thread(torrentServer)).start();

			FileServer fileServer = new FileServer();
			(new Thread(fileServer)).start();

			GradingServer testingServer = new GradingServer();
			(new Thread(testingServer)).start();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
