const toSteamid = require('../../to-steamid');
const validate = require('../validate');

const requestItems = require('../actions/request-items.js');
const sendItems = require('../actions/request-items.js');

class Handler {
	constructor(registry) {
		this.registry = registry;
	}

	requestItems(req, res) {
		return requestItems(req, res);
	}

	sendItems(req, res) {
		return sendItems(req, res);
	}
}

module.exports = Handler;