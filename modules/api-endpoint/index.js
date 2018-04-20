const express = require('express');
const routes = require('./routes.js');
const Handler = require('./handler');

class APIEndpoint {
	constructor (port, modules) {
		this.modules = modules;
		this.port = port;
		this.app = express();

		this.handler = new Handler(this.modules);
		routes(this.app, this.handler);
	}

	listen() {
		let server = this.app.listen(this.port, () => {
			console.log(`API Endpoint started at port: ${server.address().port}`);
		});

		return server;
	}
}

module.exports = APIEndpoint;