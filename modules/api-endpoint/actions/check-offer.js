const validate = require('../validate');
const toSteamid = require('../../to-steamid');

module.exports = async (req, res, modules) => {
	// region Validation
	let query = req.query;

	let requires = [
		'offerid', 'gsuser', 'gspassword'
	];

	let errors = validate(requires, query);

	if (errors) {
		return res.send(errors);
	}
	// endregion

	let pdao = new modules.Data.PendingTradesDao(modules.mysql);

	try {
		let check = await pdao.checkTradeOffer(query.offerid);

		if (chec.length <= 0) return res.send({message: 'An error occurred.'});

		let row = check[0];

		let bot = modules.registry.getBotByName(row.botname);

		if ( Date.now() >= row.expires_at) {
			bot.cancelTradeOffer(parseInt(query.offerid));

			return res.send({message: 'Time limit exceed. Trade offer canceled.'});
		}

		let offer = await bot.getTradeOffer(parseInt(query.offerid));

		if (offer.trade_offer_state === 3) {
			let items = row.items;
			let isIncomingOffer = row.in_out === 'in';

			// TODO get price for items

			// TODO add to own inventory

			// TODO finish update coins

			let user = await modules.gamesparks.authenticateUser(query.gsuser, query.gspassword);
			let body = await modules.gamesparks.executeCloudFunction(user.userId, '.LogEventRequest', {eventKey: 'updateCoins',coins: 1000});
			return res.send({message: 'Trade offer accepted. Account credited'});
		}
	} catch (e) { console.log(e) ;}

	res.send({message: 'An error occurred.'});
};