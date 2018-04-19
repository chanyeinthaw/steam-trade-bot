const Handler = require('./handler');

module.exports = (app, handler) => {
	app.get('/request-actions', handler.requestItems.bind(handler));
	app.get('/send-actions', handler.sendItems.bind(handler));
};