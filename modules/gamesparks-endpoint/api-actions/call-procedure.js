module.exports = async (req, res, modules) => {
	let query = req.query;

	let credentials = JSON.parse(query.credentials);

	//region VALIDATION
	if (!query.hasOwnProperty('request')) {
		return res.send({
			error: 'request required'
		});
	}

	if (!query.hasOwnProperty('data')) {
		return res.send({
			error: 'data required'
		});
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

	try {
		let user = await modules.gamesparks.authenticateUser(credentials.userName, credentials.password);
		let body = await modules.gamesparks.executeCloudFunction(user.userId, query.request, data);

		res.send(body);
	} catch(e) {
		res.send({error: e.message});
	}
};