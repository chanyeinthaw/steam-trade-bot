const validate = require('../validate');
const toSteamid = require('../../to-steamid');

module.exports = async (req, res, modules) => {
	//region validation
	let query = req.query;

	let requires = [
		'partner', 'token', 'items'
	];

	let errors = validate(requires, query);

	if (errors) return res.send(errors);
	//endregion

	if (modules.registry.getIdleBotCount() <= 0) return res.send({error: 'Bots are busy or offline.'});

	let idleBot = modules.registry.getIdleBot();

	let message = Buffer.from(idleBot.getBotName() + Date.now().toString())
		.toString('base64')
		.replace(/=/g, '');

	let response = {status: 'failed', tradeofferid: null, message: ''};

	try {
		let conn = await modules.db.connection();
		let allowedItem = modules.db.allowedItem(conn);
		let pendingTrade = modules.db.pendingTrade(conn);

		let items = JSON.parse(query.items);
		let allowItems = await allowedItem.checkItems(items);

		if (allowItems.length <= 0) {
			idleBot.releaseBot();
			return res.send(response);
		}

		let body = await idleBot.sendTradeOffer(toSteamid(query.partner), query.token, allowItems, [], message);

		if (body.hasOwnProperty('tradeofferid'))
			pendingTrade.addTradeOffer(body.tradeofferid, idleBot.getBotName(), JSON.stringify(allowItems), 'in');

		response.status = 'success'; response.tradeofferid = body.tradeofferid;

		conn.end();
	} catch(e) {
		response.message = e.message;
	}

	res.send(response);
	idleBot.releaseBot();
};