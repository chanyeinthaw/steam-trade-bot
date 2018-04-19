const Handler = require('./handler');

module.exports = (app, handler) => {
	app.get('/request-items', handler.requestItems.bind(handler));
};