const QUERYS = {
	check: 'select assetid from allowed_items where assetid in (?)',
	insert: 'INSERT into pending_trades SET ?'
};

class AllowedItemsDao {
	constructor(conn) {
		this.conn = conn;
	}

	checkItems(items) {
		let assetIdArray = [];

		for(let i = 0; i < items.length; i++) {
			assetIdArray.push(items[i].assetid);
		}

		return this.conn.query(QUERYS.check, [assetIdArray]);
	}

	async addTradeOffer(offerId, botName, items, inout) {
		try {
			let result = await this.conn.query(QUERYS.insert, {
				offerid: offerId,
				botname: botName,
				items: items,
				in_out: inout,
				expires_at: Date.now() + (15 * 60000)
			});

			return result.affectedRows > 0;
		} catch (e) {
			return false;
		}
	}
}

module.exports = AllowedItemsDao;