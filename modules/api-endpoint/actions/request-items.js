const validate = require('../validate');
const toSteamid = require('../../to-steamid');

module.exports = async (req, res) => {
	//region validation
	let query = req.query;

	let requires = [
		'partner', 'token', 'items', 'game'
	];

	let errors = validate(requires, query);

	if (errors) return res.send(errors);
	//endregion

	const bots = global.app.bots;
	const game = global.gameConfig[req.game];

	if (bots.getIdleBotCount() <= 0) return res.send({error: 'Bots are busy or offline.'});

	let response = {status: 'failed', tradeofferid: null, message: ''};
	let idleBot = null;
	try {
		let conn = await global.app.db.connection();
		let allowedItem = global.app.db.allowedItem(conn);
		let pendingTrade = global.app.db.pendingTrade(conn);

		let items = JSON.parse(query.items);

		// region get appropriate bot and items based on game and items
		let obj = await bots.getBot(game, items);
		idleBot = obj.bot;
		items = obj.items;
		//endregion

		let message = Buffer.from(idleBot.getBotName() + Date.now().toString())
			.toString('base64')
			.replace(/=/g, '');

		let allowItems = await allowedItem.checkItems(items, game.appId);

		if (allowItems.length <= 0) {
			idleBot.releaseBot();
			return res.send(response);
		}

		let body = await idleBot.sendTradeOffer(toSteamid(query.partner), query.token, allowItems, [], message);

		if (body.hasOwnProperty('tradeofferid')) {
			let tf = await pendingTrade.addTradeOffer(body.tradeofferid, idleBot.getBotName(), message, JSON.stringify(allowItems), 'in')

			if (tf) {
				let offerrows = await pendingTrade.checkTradeOffer(body.tradeofferid);
				if (offerrows.length > 0) {
					global.app.offerChecker.addOffer(offerrows[0], req.loggedUserId, game.appId);
				}
			}
		}

		response.status = 'success'; response.tradeofferid = body.tradeofferid;

		conn.end();
	} catch(e) {
		response.message = e.message;
	}

	res.send(response);
	idleBot.releaseBot();
};