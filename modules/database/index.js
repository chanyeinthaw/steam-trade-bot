module.exports = {
	pendingTrade: require('./query/pending-trade.js'),
	allowedItem: require('./query/allowed-item.js'),
	inventoryItem: require('./query/inventory-item.js'),
	user: require('./query/user.js'),

	async connection() {
		return await require('./connector.js')(global.mysqlConfig);
	}
};