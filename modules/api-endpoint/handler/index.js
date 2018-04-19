const toSteamid = require('../../to-steamid');
const validate = require('../validate');

class Handler {
	constructor(registry) {
		this.registry = registry;
	}

	requestItems(req, res) {
		let query = req.query;

		let requires = [
			'partner', 'token', 'items'
		];

		let errors = validate(requires, query);

		if (errors) {
			return res.send(errors);
		}

		if (this.registry.getIdleBotCount() <= 0) {
			return res.send({
				error: 'Bots are busy or offline.'
			});
		}

		let idleBot = this.registry.getIdleBot();

		idleBot.sendTradeOffer(toSteamid(query.partner), query.token, JSON.parse(query.items), [], idleBot.getBotName(), (err, body) => {
			if (err) {
				res.send(err.message);
			} else {
				res.send(JSON.stringify(body));
			}
		});

		idleBot.releaseBot();
	}
}

module.exports = Handler;