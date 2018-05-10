const execute = require('../execute.js');

const QUERYS = {
	check: 'SELECT botname, items, in_out FROM pending_trades WHERE offerid = ?',
	delete: 'DELETE FROM pending_trades WHERE offerid = ?',
	insert: 'INSERT into pending_trades SET ?'
};

module.exports = {
	async checkTradeOffer(offerId) {
		return await execute(QUERYS.check, [offerId]);
	},

	async deleteTradeOffer(offerId) {
		return await execute(QUERYS.delete, [offerId]);
	},

	async addTradeOffer(offerId, botName, items, inout) {
		try {
			let result = await execute(QUERYS.insert, {
				offerid: offerId,
				botname: botName,
				items: items,
				in_out: inout
			});

			return result.affectedRows > 0;
		} catch (e) {
			console.log(e);
			return false;
		}
	}
};