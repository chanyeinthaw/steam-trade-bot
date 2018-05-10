const connector = require('../connector.js');

const QUERYS = {
	check: 'SELECT botname, items, in_out, expires_at FROM pending_trades WHERE offerid = ?',
	delete: 'DELETE FROM pending_trades WHERE offerid = ?',
	insert: 'INSERT into pending_trades SET ?'
};

module.exports = {
	async checkTradeOffer(offerId) {
		let conn = await connector();
		let res = conn.query(QUERYS.check, [offerId]);

		conn.end();

		return res;
	},

	async deleteTradeOffer(offerId) {
		let conn = await connector();
		let res = conn.query(QUERYS.delete, [offerId]);

		conn.end();

		return res;
	},

	async addTradeOffer(offerId, botName, items, inout) {
		try {
			let conn = await connector();
			let result = await conn.query(QUERYS.insert, {
				offerid: offerId,
				botname: botName,
				items: items,
				in_out: inout,
				expires_at: Date.now() + (15 * 60000)
			});

			conn.end();

			return result.affectedRows > 0;
		} catch (e) {
			console.log(e);
			return false;
		}
	}
};