const Handler = require('./handler');

module.exports = (app, handler) => {
	app.get('/request-item-trade', handler.requestItemTrade.bind(handler));
};