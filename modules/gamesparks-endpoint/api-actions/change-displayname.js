const callCC = require('../call-cloud-code.js');

module.exports = async (req, res) => {
	let query = req.query;

	if (!query.hasOwnProperty('name')) {
		return res.send({error: 'name value required'});
	}

	//endregion

	try {
		res.send(await callCC('.ChangeUserDetailsRequest', {
			displayName: query.name
		}, req.loggedUserId));
	} catch(e) {
		res.send({error: e.message});
	}
};