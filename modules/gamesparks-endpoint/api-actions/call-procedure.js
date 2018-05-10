module.exports = async (req, res) => {
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
	const gs = global.app.gs;

	try {
		let user = await gs.authenticateUser(credentials.userName, credentials.password);
		let body = await gs.executeCloudFunction(user.userId, query.request, data);

		res.send(body);
	} catch(e) {
		res.send({error: e.message});
	}
};