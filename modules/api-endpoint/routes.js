const Handler = require('./handler');

module.exports = (app, handler) => {
	//region ACCESS KEY FILTER
	app.use((req, res, next) => {
		const check = [
			'/gamesparks/register',
			'/gamesparks/login',
		];

		let url = req.url;

		if (req.url.indexOf('?') >= 0) {
			url = url.split('?')[0];
		}

		let found = check.find((el) => {
			return el === url;
		});

		if (found) {
			if (!req.query.hasOwnProperty('access_key')) {
				res.send({
					error: 'access key required'
				});

				return;
			} else {
				if (req.query.access_key !== 'foolish') {
					res.send({
						error: 'invalid access key'
					});

					return;
				}
			}
		}

		next();
	});
	//endregion

	app.get('/request-actions', handler.requestItems.bind(handler));
	app.get('/send-actions', handler.sendItems.bind(handler));
	app.get('/test-endpoint', handler.testEndpoint.bind(handler));

	app.get('/gamesparks/register', handler.gamesparksRegister.bind(handler));
	app.get('/gamesparks/login', handler.gamesparksLogin.bind(handler));
};