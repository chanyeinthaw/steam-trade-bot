const validate = require('../validate');
const toSteamid = require('../../to-steamid');

class Msg {
	constructor(message, state, offer) {
		this.message = message;
		this.state = state;
		this.offer = offer;
	}
}

module.exports = async (req, res) => {
	// region Validation
	let query = req.query;

	let requires = ['offerid', 'game'];

	let errors = validate(requires, query);

	if (errors) {
		return res.send(errors);
	}
	// endregion

	const game = global.gameConfig[req.game];

	try {
		const db = global.app.db, gs = global.app.gs, bots = global.app.bots;

		let conn = await db.connection(),
			allowedItem = db.allowedItem(conn),
			pendingTrade = db.pendingTrade(conn),
			inventoryItem = db.inventoryItem(conn),
			user = db.user(conn);

		let check = await pendingTrade.checkTradeOffer(query.offerid);

		if (check.length <= 0) return res.send(new Msg('Trade offer not found.', -1, null));

		let row = check[0];

		let bot = bots.getBotByName(row.botname);

		let offer = await bot.getTradeOffer(parseInt(query.offerid));

		if (offer.trade_offer_state === 3) {
			let items = JSON.parse(row.items);
			let isIncomingOffer = row.in_out === 'in';
			let totalCoins = await allowedItem.getTotalCoins(items, game.appId);

			// TODO add to own inventory
			let receivedItems = await bot.getItemsOfCompletedOffer(offer);

			await inventoryItem.addItems(receivedItems, row.botname, row.in_out);

			//region update coins
			if (!isIncomingOffer) totalCoins *= -1;

			await gs.executeCloudFunction(
				(await gs.authenticateUser(`user${req.loggedUserId}`, await user.getGamesparksPassword(req.loggedUserId))).userId,
				'.LogEventRequest',
				{eventKey: 'updateCoins',coins: totalCoins});
			//endregion

			pendingTrade.deleteTradeOffer(query.offerid); conn.end();

			return res.send(new Msg(`Trade offer ${query.offerid} accepted. Account credited`, offer.trade_offer_state, offer));
		} else if (offer.trade_offer_state === 6 || offer.trade_offer_state === 5 || offer.trade_offer_state === 7) {
			pendingTrade.deleteTradeOffer(query.offerid); conn.end();

			return res.send(new Msg(`Trade offer ${query.offerid} cancled or expired.`, offer.trade_offer_state, offer));
		} else if (offer.trade_offer_state === 2 || offer.trade_offer_state === 9) {
			return res.send(new Msg(`Trade offer ${query.offerid} active.`, offer.trade_offer_state, offer));
		} else {
			pendingTrade.deleteTradeOffer(query.offerid); conn.end();

			return res.send(new Msg(`Trade offer ${query.offerid} no longer valid.`, offer.trade_offer_state, offer));
		}
	} catch (e) { console.log(e) ;}

	res.send(new Msg(`An error occurred.`, -3, null));
};