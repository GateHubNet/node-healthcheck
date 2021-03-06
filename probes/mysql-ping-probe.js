const wrap = require('../function-wrapper.js');
const PingProbe = require('./ping-probe.js');

module.exports = class MysqlProbe extends PingProbe {
    constructor() {
        super('mysql');

        this.client = null;
        this.attached = false;
    }

    // Attach should extract the mysql object
    attach(target) {
        if (!target || target.__healthProbeAttached__) return target;
        target.__healthProbeAttached__ = this.attached = true;

        let data = {};
        wrap.after(target, 'createConnection', data, (target, methodName, args, probeData, ret) => {
            this.client = ret;
            return ret;
        });

        return target;
    }

    ping(timeout) {
        return new Promise((res, rej) => {
            if (!this.client) return rej();
            this.client.ping({
                timeout
            }, (err) => {
                if (err) {
                    rej();
                } else {
                    res();
                }
            });
        });
    }
};
