const Requests = require('../../gamesparks-endpoint').Requests;

module.exports = (req, res, modules) => {
	let query = req.query;

	if (query.hasOwnProperty('username') && query.hasOwnProperty('password') && query.hasOwnProperty('displayname')) {
		modules.gamesparks.registerUser(query.displayname, query.username, query.password, (err, body) => {
			if (!err) {
				res.send(body);
			} else {
				res.send(err.message);
			}
		});

		return;
	}

	res.send({
		error: 'invalid inputs'
	});
};