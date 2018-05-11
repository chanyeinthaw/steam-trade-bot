module.exports = async (req, res) => {
	let query = req.query;

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
			error: 'invalid json data'
		});

		return;
	}
	//endregion
	const gs = global.app.gs;
	const db = global.app.db;

	try {
		const conn = await db.connection();
		const userq = db.user(conn);

		const credentials = {
			userName: `user${req.loggedUserId}`,
			password: await userq.getGamesparksPassword(req.loggedUserId)
		};

		conn.end();

		let body = await gs.executeCloudFunction(
			(await gs.authenticateUser(credentials.userName, credentials.password)).userId,
			query.request,
			data
		);

		res.send(body);
	} catch(e) {
		res.send({error: e.message});
	}
};