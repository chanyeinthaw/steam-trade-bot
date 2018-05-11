module.exports = (app) => {
	app.get('/request-items', require('./actions/request-items.js'));
	app.get('/send-items', require('./actions/send-items.js'));
	app.get('/check-offer', require('./actions/check-offer.js'));
	app.get('/test-endpoint', require('./actions/test-endpoint.js'));

	global.app.gs.registerRoutes(app);
};