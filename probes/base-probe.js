module.exports = class BaseProbe {

	constructor(name) {
		this.name = name;
	}

	attach() { throw new Error('Method attach not implemented'); }
	
	healthy() { throw new Error('Method healthy not implemented'); }

	start() { throw new Error('Method start not implemented'); }

	stop() { throw new Error('Method stop not implemented'); }
}