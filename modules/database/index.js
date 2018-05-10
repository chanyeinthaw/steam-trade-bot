module.exports = {
	pendingTrade: require('./query/pending-trade.js'),
	allowedItem: require('./query/allowed-item.js'),
	inventoryItem: require('./query/inventory-item.js'),
	async connection() {
		return await require('./connector.js')(global.mysqlConfig);
	}
};