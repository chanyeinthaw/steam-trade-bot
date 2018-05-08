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

	let pdao = new modules.Data.PendingTradesDao(modules.mysql);
	let adao = new modules.Data.AllowedItemsDao(modules.mysql);
	let response = {status: 'failed', tradeofferid: null, message: ''};

	try {
		let items = JSON.parse(query.items);
		let allowItems = [];
		let allowedAssets = await adao.checkItems(items); // get allowed assetids of items array from database;

		// region check if item is allowed
		for(let i = 0; i < items.length; i++) {
			let assetId = items[i].assetid;
			let shouldAdd = false;

			for(let ii = 0; ii < allowedAssets.length; ii++) {
				if (assetId == allowedAssets[ii].assetid) {
					shouldRemove = true; break;
				}
			}

			if (shouldAdd) allowItems.push(items[i]);
		}
		//endregion

		if (allowItems.length <= 0) return res.send(response);

		let body = await idleBot.sendTradeOffer(toSteamid(query.partner), query.token, allowItems, [], message);

		if (body.hasOwnProperty('tradeofferid'))
			pdao.addTradeOffer(body.tradeofferid, idleBot.getBotName(), JSON.stringify(allowItems), 'in');

		response.status = 'success'; response.tradeofferid = body.tradeofferid;
	} catch(e) {
		response.message = e.message;
	}

	res.send(response);
	idleBot.releaseBot();
};