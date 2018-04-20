const toSteamid = require('../../to-steamid');
const validate = require('../validate');

const requestItems = require('../actions/request-items.js');
const sendItems = require('../actions/send-items.js');
const testEndpoint = require('../actions/test-endpoint.js');

const gamespark = {
	register: require('../../gamesparks-endpoint/api-actions/register.js'),
	login: require('../../gamesparks-endpoint/api-actions/login.js')
};

class Handler {
	constructor(modules) {
		this.modules = modules;
	}

	requestItems(req, res) {
		return requestItems(req, res, this.modules);
	}

	sendItems(req, res) {
		return sendItems(req, res, this.modules);
	}

	gamesparksRegister(req, res) {
		return gamespark.register(req, res, this.modules);
	}

	gamesparksLogin(req, res) {
		return gamespark.login(req, res, this.modules);
	}

	testEndpoint(req, res) {
		return testEndpoint(req, res, this.modules);
	}
}

module.exports = Handler;