module.exports = async (req, res) => {
	let query = req.query;

	if (!(query.hasOwnProperty('username') && query.hasOwnProperty('password') && query.hasOwnProperty('displayname'))) {
		return res.send({
			error: 'invalid inputs'
		});
	}

	let body = null;

	try {
		body = await global.app.gs.registerUser(query.displayname, query.username, query.password);
	} catch (e) {
		return res.send({
			error: e.message
		});
	}

	res.send(body);
};