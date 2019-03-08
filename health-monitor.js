const _ = require('lodash');

module.exports = class HealthMonitor {
    constructor() {
        this._probes = [];
    }

    // Returns true if all of the services are healthy
    healthy() {
        return this._probes.reduce((prev, cur) => cur.attached ? prev && cur.healthy() : prev, true);
    }

    // Returns the servies and their statuses
    services() {
        return this._probes.reduce((prev, cur) => {
            if(cur.attached) {
                prev[cur.name] = cur.healthy() ? 'OK' : 'FAIL';
            }
            return prev;
        }, {});
    }

    // Enables a specific probe
    enable(service) {
        if(_.includes(this._probes, service)) return this._probes[service];

        try {
            const s = require(`./probes/${service}-probe.js`);
            this._probes.push(new s());
        } catch(e) {
            console.log(e);
            console.error(`Probe ${service} does not exist, skipping`);
        }
    }

    attachProbe(name, target) {
        const probe = _.find(this._probes, (v, i, c) => v.name === name);
        if(probe) {
            probe.attach(target);
        } else {
            console.info(`Probe ${name} does not exist or is not loaded`);
        }
        return target;
    }

    hasProbe(name) {
        return _.find(this._probes, (v, i, c) => v.name === name) !== undefined;
    }

    // Disables a probe
    disable(service) {
        const pr = _.find(this._probes, (v, i, c) => v.name === service);
        if(pr) pr.stop();
        _.remove(this._probes, (v, i, c) => v.name === service);
    }

    // Starts all the healthchecking probes
    start() {
        for(const p of this._probes) p.start();

        process.on('exit', () => this.stop());
    }

    stop() {
        for(const p of this._probes) p.stop();
    }
};
