'use strict';

const _ = require('lodash'),
	  HttpStatus = require('http-status-codes'),
	  getPort = require('get-port'),
	  koa = require('koa'),
	  router = require('koa-router');

const HealthMonitor = require('./health-monitor.js'),
	  wrap = require('./function-wrapper.js');

/**
 * formatOutput formats the response based on verbosity and health of the services
 * @param verbose | boolean
 * @param monitor | HealthMonitor
 * @returns object
*/
function formatOutput(verbose, monitor) {
	if(!verbose) {
		// Return only the status
		if(monitor.healthy()) {
			return { status: HttpStatus.NO_CONTENT };
		}
		return { status: HttpStatus.BAD_REQUEST };
	}

	if(monitor.healthy()) {
		return { status: HttpStatus.OK, services: monitor.services() };
	}  else {
		return { status: HttpStatus.BAD_REQUEST, services: monitor.services() };
	}
}

module.exports = async function(config) {
	_.defaults(config, {port: null, enable: [], verbose: false});

	const monitor = new HealthMonitor();
	for(const s of config.enable) {
		monitor.enable(s);
	}

	monitor.start();

	let data = {};

	// Patch the require function
	wrap.after(module.__proto__, 'require', data, function(obj, methodName, args, context, ret) {
	  if (ret !== null) {
	  	if(monitor.hasProbe(args[0])) {
	  		return monitor.attachProbe(args[0], ret);
	  	}
	  }
	  return ret;
	});

	const fn = _.partial(formatOutput, config.verbose, monitor);
	if(!config.port) return fn;

	if((await getPort({port: config.port})) !== config.port) {
		// The port is taken
		throw new Error(`Port ${config.port} is taken.`);
	}

	// Create a new http server with one route for metrics
	let app = new koa();
	let server = app.listen(config.port);
	let r = new router();
	r.get('/healthz', (ctx) => {
		let rsp = fn();
		
		ctx.status = rsp.status;
		if(rsp.services) { 
			ctx.body = rsp.services;
		} else {
			ctx.body = "";
		}
	});

	app.use(r.routes());
    app.use(r.allowedMethods());	

	console.info(`Health exposed on :${config.port}`);
}	