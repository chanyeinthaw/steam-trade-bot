const express = require('express');
const jwt = require('jsonwebtoken');
const routes = require('./routes.js');

class Err {
	constructor(msg) {
		this.error = msg;
	}
}

class APIEndpoint {
	constructor (port) {
		this.port = port;
		this.app = express();

		this.registerJwtAuth();
	}

	registerJwtAuth() {
		let jwtSecret = global.app.env.jwtSecret;

		this.app.use((req, res, next) => {
			if (req.url.indexOf('/gamesparks/update-user-points') >= 0) return next();
            if (req.url.indexOf('/send-items') >= 0) return next();
			if (!req.query.hasOwnProperty('session_id')) return res.send(new Err('session_id required'));

			try {
				req.loggedUserId = jwt.verify(req.query.session_id, jwtSecret).sub;
				return next();
			} catch (e) {
				return res.send(new Err(e.message));
			}
		});
	}

	run() {
		routes(this.app);

		let server = this.app.listen(this.port, () => {
			console.log(`API Endpoint started at port: ${server.address().port}`);
		});

		return server;
	}
}

module.exports = APIEndpoint;