const toSteamid = require('../../to-steamid');
const validate = require('../validate');

class Handler {
	constructor(registry) {
		this.registry = registry;
	}

	requestItemTrade(req, res) {
		let query = req.query;

		let requires = [
			'partner', 'token', 'items'
		];

		let errors = validate(requires, query);

		if (errors) {
			return res.send(errors);
		}

		console.log(this);

		res.send(query);
	}
}

module.exports = Handler;