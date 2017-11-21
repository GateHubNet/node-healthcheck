const wrap = require('../function-wrapper.js'),
	  BaseProbe = require('./base-probe.js');

module.exports = class AmqpProbe extends BaseProbe {
	constructor() {
		super('amqplib');

		this.isHealthy = false;
		this.attached = false;
	}

	attach(target) {
		const self = this;
		if(!target || target.__healthProbeAttached__) return target;
		target.__healthProbeAttached__ = this.attached = true;

		let data = {};
		wrap.after(target, 'connect', data, function(target, methodName, methodArgs, context, client) {
			return client.then((cm) => {
				// Bind to error and close events on the channel
				// Better yet, bind to error event on the connection because amqplib has a liveness heartbeat
				// enabled by default
				self.isHealthy = true;
				cm.on('error', (err) => {
					self.isHealthy = false;
				});
				return cm;
			});
		});

		return target;
	} 

	healthy() { return this.isHealthy; }

	start(){}
	stop() {}
}