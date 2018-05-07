const validate = require('../validate');
const toSteamid = require('../../to-steamid');

module.exports = async (req, res, modules) => {
	let query = req.query;

	let requires = [
		'partner', 'token', 'items'
	];

	let errors = validate(requires, query);

	if (errors) {
		return res.send(errors);
	}

	if (modules.registry.getIdleBotCount() <= 0) {
		return res.send({
			error: 'Bots are busy or offline.'
		});
	}

	let idleBot = modules.registry.getIdleBot();

	let message = Buffer.from(idleBot.getBotName() + Date.now().toString())
		.toString('base64')
		.replace(/=/g, '');

	try {
		let body = await idleBot.sendTradeOffer(toSteamid(query.partner), query.token, JSON.parse(query.items), [], message);

		res.send(JSON.stringify(body));
	} catch(e) {
		res.send(e.message);
	}

	idleBot.releaseBot();
};