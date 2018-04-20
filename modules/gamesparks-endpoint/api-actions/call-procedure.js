module.exports = (req, res, modules) => {
	let query = req.query;

	let credentials = JSON.parse(query.credentials);

	//region VALIDATION
	if (!query.hasOwnProperty('request')) {
		res.send({
			error: 'request required'
		});
		return;
	}

	if (!query.hasOwnProperty('data')) {
		res.send({
			error: 'data required'
		});
		return;
	}

	let data = null;

	try {
		data = JSON.parse(query.data);
	} catch(e) {
		res.send({
			error: 'invalid data'
		});

		return;
	}
	//endregion
	console.log('credentials');
	console.log(credentials);
	modules.gamesparks.authenticateUser(credentials.userName, credentials.password, (err, user) => {
		console.log('authuser');
		console.log(err, user);
		if (err) return res.send(err);

		modules.gamesparks.executeCloudFunction(user.userId, query.request, data, (err, body) => {
			console.log('execcu');
			console.log(err, user);
			if (err) return res.send(err);

			res.send(body);
		});
	});
};