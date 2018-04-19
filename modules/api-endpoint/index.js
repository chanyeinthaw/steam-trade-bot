const express = require('express');
const routes = require('./routes.js');

class APIEndpoint {
	constructor (port) {
		this.port = port;
		this.app = express();

		for(let i in routes) {
			this.app.get(i, routes[i]);
		}
	}

	listen() {
		let server = this.app.listen(this.port, () => {
			console.log(`API Endpoint started at port: ${server.address().port}`);
		});

		return server;
	}
}

module.exports = APIEndpoint;