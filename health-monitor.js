const _ = require('lodash');

module.exports = class HealthMonitor {
	constructor() {
		this.probes = [];
	}	

	// Returns true if all of the services are healthy
	healthy() {
		return this.probes.reduce((prev, cur) => {
			if(cur.attached) {
				return prev && cur.healthy();
			}
			return prev;
		}, true);
	}

	// Returns the servies and their statuses
	services() {
		return this.probes.reduce((prev, cur) => { 
			if(cur.attached) {
				prev[cur.name] = cur.healthy() ? 'OK' : 'FAIL'; 
			}
			return prev; 
		}, {});
	}

	// Enables a specific probe
	enable(service) {
		if(_.includes(this.probes, service)) return this.probes[service];

		try {
			const s = require(`./probes/${service}-probe.js`);
			this.probes.push(new s());
		} catch(e) {
			console.error(`Probe ${service} does not exist, skipping`);
		}
	}

	attachProbe(name, target) {
		const probe = _.find(this.probes, (v, i, c) => v.name === name);
		if(probe) {
			probe.attach(target);
		} else {
			console.info(`Probe ${name} does not exist or is not loaded`);
		}
		return target;
	}

	hasProbe(name) {
		return _.find(this.probes, (v, i, c) => v.name === name) !== undefined;
	}

	// Disables a probe
	disable(service) {
		const pr = _.find(this.probes, (v, i, c) => v.name === service);
		if(pr) pr.stop();
		_.remove(this.probes, (v, i, c) => v.name === service);
	}

	// Starts all the healthchecking probes
	start() {
		for(const p of this.probes) p.start();

		process.on('exit', () => this.stop());
	}

	stop() {
		for(const p of this.probes) p.stop();
	}
};