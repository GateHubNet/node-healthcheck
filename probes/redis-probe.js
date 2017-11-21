const BaseProbe = require('./base-probe.js'),
	  wrap = require('../function-wrapper.js');

module.exports = class RedisProbe extends BaseProbe {
	constructor() {
		super('redis');

		this.attached = false;
	}

	attach(target) {
		if(!target || target.__healthProbeAttached__) return target;
		target.__healthProbeAttached__ = this.attached = true;

		let data = {};
		wrap.after(target, 'createClient', data, (target, methodName, args, probeData, ret) => {
			this.client = ret;
			return ret;
		});

		return target;
	}

	start() {}
	stop() {}

	healthy() { return this.client && this.client.connected; }
}	  