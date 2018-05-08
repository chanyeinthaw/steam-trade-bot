const requestItems = require('../actions/request-items.js');
const sendItems = require('../actions/send-items.js');
const checkOffer = require('../actions/check-offer.js');
const testEndpoint = require('../actions/test-endpoint.js');

const gamespark = {
	register: require('../../gamesparks-endpoint/api-actions/register.js'),
	callProcedure: require('../../gamesparks-endpoint/api-actions/call-procedure.js')
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

	checkOffer(req, res) {
		return checkOffer(req, res, this.modules);
	}

	gamesparksRegister(req, res) {
		return gamespark.register(req, res, this.modules);
	}

	callProcedure(req, res) {
		return gamespark.callProcedure(req, res, this.modules);
	}

	testEndpoint(req, res) {
		return testEndpoint(req, res, this.modules);
	}
}

module.exports = Handler;