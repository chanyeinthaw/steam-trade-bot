async function checkOffer(row, userid, iid) {
	const db = global.app.db, gs = global.app.gs, bots = global.app.bots;

	let conn = await db.connection(),
		allowedItem = db.allowedItem(conn),
		pendingTrade = db.pendingTrade(conn),
		inventoryItem = db.inventoryItem(conn),
		user = db.user(conn);

	let bot = bots.getBotByName(row.botname);

	let offer = await bot.getTradeOffer(parseInt(row.offerid));

	if (offer.trade_offer_state === 3) {
		let items = JSON.parse(row.items);
		let isIncomingOffer = row.in_out === 'in';
		let totalCoins = await allowedItem.getTotalCoins(items);

		inventoryItem.addItems(items, row.botname, row.in_out);

		//region update coins
		if (!isIncomingOffer) totalCoins *= -1;

		await gs.executeCloudFunction(
			(await gs.authenticateUser(`user${userid}`, await user.getGamesparksPassword(userid))).userId,
			'.LogEventRequest',
			{eventKey: 'updateCoins',coins: totalCoins});
		//endregion

		pendingTrade.deleteTradeOffer(row.offerid); conn.end();
		clearInterval(iid);

		console.log(`Trade offer ${row.offerid} accepted. Account credited `, offer.trade_offer_state);
	} else if (offer.trade_offer_state === 6 || offer.trade_offer_state === 5 || offer.trade_offer_state === 7) {
		pendingTrade.deleteTradeOffer(row.offerid); conn.end();
		clearInterval(iid);

		console.log(`Trade offer ${row.offerid} canceled or expired `, offer.trade_offer_state);
	} else if (offer.trade_offer_state === 2 || offer.trade_offer_state === 9) {
		console.log(`Trade offer ${row.offerid} active `, offer.trade_offer_state);
	} else {
		pendingTrade.deleteTradeOffer(row.offerid); conn.end();
		clearInterval(iid);

		console.log(`Trade offer ${row.offerid} no longer valid `, offer.trade_offer_state);
	}
}

class OfferChecker {
	constructor() {
		this.offers = [];
		this.checkInterval = global.offerCheckInterval;
	}

	start() {
		setInterval(async () => {
			if (this.offers.length <= 0) return;
			let todel = [];
			console.log(`Offer checker checking ${this.offers.length} offers.`);
			for(let i = 0; i < this.offers.length; i++) {
				let offer = this.offers[i];
				let sdelete = await this.checkOffer(offer.offer, offer.userid, i, offer.appid);

				if (sdelete) {
					todel.push(i);
				}
			}

			for(let i in todel) {
				this.offers.splice(todel[i],1);
			}
		}, this.checkInterval);
	}

	async checkOffer(row, userid, i, appid) {
		const db = global.app.db, gs = global.app.gs, bots = global.app.bots;

		let conn = await db.connection(),
			allowedItem = db.allowedItem(conn),
			pendingTrade = db.pendingTrade(conn),
			inventoryItem = db.inventoryItem(conn),
			user = db.user(conn);

		let bot = bots.getBotByName(row.botname);

		let offer = await bot.getTradeOffer(parseInt(row.offerid));

		if (offer.trade_offer_state === 3) {
			let items = JSON.parse(row.items);
			let isIncomingOffer = row.in_out === 'in';
			let totalCoins = await allowedItem.getTotalCoins(items, appid);

			let receivedItems = await bot.getItemsOfCompletedOffer(offer);

			await inventoryItem.addItems(receivedItems, row.botname, row.in_out);

			//region update coins
			if (!isIncomingOffer) totalCoins *= -1;

			await gs.executeCloudFunction(
				(await gs.authenticateUser(`user${userid}`, await user.getGamesparksPassword(userid))).userId,
				'.LogEventRequest',
				{eventKey: 'updateCoins',coins: totalCoins});
			//endregion

			pendingTrade.deleteTradeOffer(row.offerid); conn.end();

			console.log(`Trade offer ${row.offerid} accepted. Account credited `, offer.trade_offer_state);
		} else if (offer.trade_offer_state === 6 || offer.trade_offer_state === 5 || offer.trade_offer_state === 7) {
			pendingTrade.deleteTradeOffer(row.offerid); conn.end();

			console.log(`Trade offer ${row.offerid} canceled or expired `, offer.trade_offer_state);
		} else if (offer.trade_offer_state === 2 || offer.trade_offer_state === 9) {
			console.log(`Trade offer ${row.offerid} active `, offer.trade_offer_state);

			return false;
		} else {
			pendingTrade.deleteTradeOffer(row.offerid); conn.end();

			console.log(`Trade offer ${row.offerid} no longer valid `, offer.trade_offer_state);
		}

		return true;
	}

	addOffer(offer, userid, appid) {
		this.offers.push({offer: offer, userid: userid, appid: appid});
	}
}

module.exports = OfferChecker;