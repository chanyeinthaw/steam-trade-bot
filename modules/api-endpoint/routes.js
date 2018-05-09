const Handler = require('./handler');

module.exports = (app, handler) => {
	//region ACCESS KEY FILTER
	app.use((req, res, next) => {
		const check = [
			'/gamesparks/register',
			'/gamesparks/call-procedure',
			'/check-offer'
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

	//region GAMESPARKS LOGIN MW
	app.use('/gamesparks/*', (req, res, next) => {
		if (!req.query.hasOwnProperty('credentials')) {
			res.send({
				error: 'credentials required'
			});
			return;
		}


		try {
			let cred = JSON.parse(req.query.credentials);

			if (!(cred.hasOwnProperty('userName') && cred.hasOwnProperty('password'))) {
				res.send({
					error: 'invalid credentials'
				});
				return;
			}
		} catch (e) {
			res.send({
				error: 'invalid credentials'
			});
			return;
		}

		next();
	});
	//endregion

	app.get('/request-items', handler.requestItems.bind(handler));
	app.get('/send-items', handler.sendItems.bind(handler));
	app.get('/check-offer', handler.checkOffer.bind(handler));
	app.get('/test-endpoint', handler.testEndpoint.bind(handler));

	app.get('/gamesparks/register', handler.gamesparksRegister.bind(handler));
	app.get('/gamesparks/call-procedure', handler.callProcedure.bind(handler));
};