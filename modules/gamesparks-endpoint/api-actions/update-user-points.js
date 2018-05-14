const callCC = require('../call-cloud-code.js');

module.exports = async (req, res) => {
	let query = req.query;

	if (!query.hasOwnProperty('data'))
		return res.send({error: 'data value required'});

	if (!query.hasOwnProperty('appKey'))
		return res.send({error: 'appKey required'});

	if (query.appKey !== global.appKey)
		return res.send({error: 'invalid appKey'});
	//endregion

	try {
		let data = JSON.parse(query.data);

		if (!Array.isArray(data)) {
			return res.send({error: 'invalid data format'});
		}

		for(let i = 0; i < data.length; i++) {
			if (!Array.isArray(data[i])) {
				return res.send({error: 'invalid data format'});
			}

			if (data[i].length !== 2) {
				return res.send({error: 'invalid data format'});
			}

			await callCC('.LogEventRequest', {
				eventKey: 'updateCoins',
				coins: parseInt(data[i][1])
			}, data[i][0])
		}

		res.send({message: 'success'});
	} catch(e) {
		res.send({error: e.message});
	}
};