const validate = require('../validate');
const toSteamid = require('../../to-steamid');

const AllowedItem = require('../../database/allowed-item.js');
const PendingTrade = require('../../database/pending-trade.js');

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
	const game = global.app.games[query.game];

	let response = {status: 'failed', tradeofferid: null, message: ''};

	let idleBot = null;
	try {
		let items = JSON.parse(query.items);

		// region get appropriate bot and items based on game and items
		let obj = await bots.getBot(game, items);
		idleBot = obj.bot;
		items = obj.items;

		if (idleBot === null) {
		    response.message = 'No bot';
            return res.send(response);
        }
		//endregion

		let message = Buffer.from(idleBot.getBotName() + Date.now().toString())
			.toString('base64')
			.replace(/=/g, '');

		let allowItems = await new AllowedItem({}).checkItems(items, game.appId);

		if (allowItems.length <= 0) {
			return res.send(response);
		}

		let body = await idleBot.sendTradeOffer(toSteamid(query.partner), query.token, allowItems, [], message, game);

		if (body.hasOwnProperty('tradeofferid')) {
		    let trade = new PendingTrade({
                offerid: body.tradeofferid,
                botname: idleBot.getBotName(),
                message: message,
                items: JSON.stringify(allowItems),
                in_out: 'in'
            });

		    let insertIds = trade.save();

			if (insertIds && insertIds > 0) {
                global.app.offerChecker.addOffer(trade.attributes, req.loggedUserId, game.appId);
			}
		}

		response.status = 'success'; response.tradeofferid = body.tradeofferid;

		conn.end();
	} catch(e) {
		response.message = e.message;
	}

	res.send(response);
};