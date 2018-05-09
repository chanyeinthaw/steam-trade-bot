const validate = require('../validate');
const toSteamid = require('../../to-steamid');

class Msg {
	constructor(message, state) {
		this.message = message;
		this.state = state;
	}
}

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

	let pdao = new modules.query.PendingTrade(modules.mysql);
	let adao = new modules.query.AllowedItem(modules.mysql);

	try {
		//region check internal tradeoffer status such as timelimit and validity
		let check = await pdao.checkTradeOffer(query.offerid);

		if (check.length <= 0) return res.send(new Msg('Trade offer not found.', -1));

		let row = check[0];

		let bot = modules.registry.getBotByName(row.botname);

		if ( Date.now() >= row.expires_at) {
			bot.cancelTradeOffer(parseInt(query.offerid));

			return res.send(new Msg('Time limit exceed. Trade offer canceled.', -2));
		}
		//endregion

		let offer = await bot.getTradeOffer(parseInt(query.offerid));

		if (offer.trade_offer_state === 3) {
			let items = JSON.parse(row.items);
			let isIncomingOffer = row.in_out === 'in';

			let totalCoins = await adao.getTotalCoins();

			// TODO add to own inventory

			//region update coins
			if (!isIncomingOffer) totalCoins *= -1;

			let user = await modules.gamesparks.authenticateUser(query.gsuser, query.gspassword);
			let body = await modules.gamesparks.executeCloudFunction(user.userId, '.LogEventRequest', {eventKey: 'updateCoins',coins: totalCoins});
			//endregion

			pdao.deleteTradeOffer(query.offerid);

			return res.send(new Msg(`Trade offer ${query.offerid} accepted. Account credited`, offer.trade_offer_state));
		} else if (offer.trade_offer_state === 6 || offer.trade_offer_state === 5 || offer.trade_offer_state === 7) {
			pdao.deleteTradeOffer(query.offerid);

			return res.send(new Msg(`Trade offer ${query.offerid} cancled or expired.`, offer.trade_offer_state));
		} else if (offer.trade_offer_state === 2 || offer.trade_offer_state === 9) {
			return res.send(new Msg(`Trade offer ${query.offerid} active.`, offer.trade_offer_state));
		} else {
			pdao.deleteTradeOffer(query.offerid);

			return res.send(new Msg(`Trade offer ${query.offerid} no longer valid.`, offer.trade_offer_state));
		}
	} catch (e) { console.log(e) ;}

	res.send(new Msg(`An error occurred.`, -3));
};