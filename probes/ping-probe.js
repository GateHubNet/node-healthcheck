const BaseProbe = require('./base-probe.js');

const PING_INTERVAL = 5000, // In milliseconds
	  PING_TIMEOUT = 1000;

module.exports = class PingProbe extends BaseProbe {
	constructor(name) {
		super(name);

		this.client = null;
		this.pinger = null;

		this.isHealthy = false;
	}

	// Start should start pinging periodically
	start() {
		const fn = async () => {
			try {
				await this.ping(PING_TIMEOUT);
				this.isHealthy = true;
			} catch(e) {
				this.isHealthy = false;
			}

			this.pinger = setTimeout(fn, PING_INTERVAL);
		};

		// Periodically send ping query
		this.pinger = setTimeout(fn, PING_INTERVAL);
	}

	// Stop should stop the periodic pinging of the service
	stop() {	
		if(this.pinger) {
			clearTimeout(this.pinger);
			this.isHealthy = false;
			this.pinger = null;
		}
	}

	ping(timeout) { throw new Error('Method ping not implemented') };

	healthy() { return this.isHealthy; }
}