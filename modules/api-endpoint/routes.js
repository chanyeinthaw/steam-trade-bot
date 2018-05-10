module.exports = (app) => {
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

	app.get('/request-items', require('./actions/request-items.js'));
	app.get('/send-items', require('./actions/send-items.js'));
	app.get('/check-offer', require('./actions/check-offer.js'));
	app.get('/test-endpoint', require('./actions/test-endpoint.js'));

	global.app.gs.registerRoutes(app);
};