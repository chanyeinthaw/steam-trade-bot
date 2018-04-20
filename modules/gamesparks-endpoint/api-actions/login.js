const Requests = require('../../gamesparks-endpoint').Requests;

module.exports = (req, res, modules) => {
	let query = req.query;

	if (query.hasOwnProperty('username') && query.hasOwnProperty('password')) {
		modules.gamesparks.authenticateUser(query.username, query.password, (err, user) => {
			res.send(user);
		});

		return;
	}

	res.send({
		error: 'invalid inputs'
	});
};