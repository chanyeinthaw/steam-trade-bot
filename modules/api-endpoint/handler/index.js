const toSteamid = require('../../to-steamid');
const validate = require('../validate');

class Handler {
	static requestItemTrade(req, res) {
		let query = req.query;

		let requires = [
			'partner', 'token', 'items'
		];

		let errors = validate(requires, query);

		if (errors) {
			return res.send(errors);
		}

		res.send(query);
	}
}

module.exports = Handler;