const callCC = require('../call-cloud-code.js');

module.exports = async (req, res) => {
	let query = req.query;

	if (!query.hasOwnProperty('points'))
		return res.send({error: 'points value required'});

	if (!query.hasOwnProperty('appKey'))
		return res.send({error: 'appKey required'});

	if (isNaN(parseInt(query.points)))
		return res.send({error: 'points value must be numeric'});

	if (query.appKey !== global.appKey)
		return res.send({error: 'invalid appKey'});
	//endregion

	try {
		res.send(await callCC('.LogEventRequest', {
			eventKey: 'updateCoins',
			coins: parseInt(query.points)
		}, req.loggedUserId));
	} catch(e) {
		res.send({error: e.message});
	}
};