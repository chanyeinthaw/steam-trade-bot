const toSteamid = require('../../to-steamid');
const validate = require('../validate');

const requestItems = require('../actions/request-items.js');
const sendItems = require('../actions/send-items.js');

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
}

module.exports = Handler;