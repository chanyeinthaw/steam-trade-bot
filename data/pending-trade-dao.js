const QUERYS = {
	check: 'SELECT botname, items, in_out expires_at FROM pending_trades WHERE offerid = ?',
	insert: 'INSERT into pending_trades SET ?'
};

class PendingTradesDao {
	constructor(conn) {
		this.conn = conn;
	}

	checkTradeOffer(offerId) {
		return this.conn.query(QUERYS.check, [offerId]);
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

module.exports = PendingTradesDao;