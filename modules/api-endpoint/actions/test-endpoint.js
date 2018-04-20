const Requests = require('../../gamesparks-endpoint').Requests;

module.exports = (req, res, module) => {
	module.gamesparks.authenticateUser('playerz', 'playerz', (err, user) => {
		module.gamesparks.executeCloudFunction(Requests.AccountDetailsRequest, {}, (err, data) => {
			res.send(data);
		});
	});
};